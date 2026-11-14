# Website V2 – arkitektur, teknologi og nøkler

Oversikt over `pytagoras-website-v2` (Pytagoras Forlag), skrevet for å kunne gjenskape oppsettet for en annen nettside.
Hentet fra koden og dokumentasjonen i repoet (`pyproject.toml`, `package.json`, `.env.example`-filene,
`docker-compose.yml`, `Caddyfile`, `railway.toml`, `core/config.py`). **Ingen hemmeligheter er lest eller gjengitt** –
bare navnene på variablene.

---

## 1. Hva systemet er

En fullstack-webapplikasjon: butikk, kundeområde, admin, innholdsleser/-editor, kurs, abonnement og en KI-assistent.
Appen er også **kontrollplanet** i plattformen: den autentiserer brukere, eier kunder/ordrer/rettigheter, og utsteder
kortlivede capability-tokens til en separat innholdstjeneste.

**Viktig prinsipp (verdt å kopiere):** *zero-config / mock-fallback.* Hver ekstern integrasjon (Stripe, Vipps, OpenRouter,
Supabase, Resend, Fiken) faller tilbake til deterministiske mock-svar når nøklene mangler. Appen kjører med null hemmeligheter
lokalt, og feiler aldri hardt på manglende nøkkel.

---

## 2. Tjenestene (runtime-arkitektur)

```
Nettleser
   │  HTTPS (én offentlig inngang)
   ▼
┌────────────────────┐
│ proxy (Caddy)      │  /api/*, /docs, /openapi.json  →  backend
│                    │  alt annet                      →  frontend
└──────┬─────────┬───┘
       ▼         ▼
 backend       frontend           Redis (cache)     Postgres 16     Supabase Storage
 FastAPI       Next.js 16         (intern)          (egen DB)       (private buckets)
       │
       └─ JWKS / capability-token ──► Innholdstjeneste (egen repo, egen DB, eget domene)
                                      Services API (egen repo, «work platform»)
                                      Video-tjeneste (egen repo)
```

| Tjeneste | Rolle | Offentlig? |
| --- | --- | --- |
| `proxy` | Caddy – eneste offentlige inngang, HTTPS lokalt (`tls internal`), ren HTTP bak Railway | ja |
| `backend` | FastAPI – API, betaling, kvitteringer, rettigheter, tokenutstedelse | nei (bak proxy) |
| `frontend` | Next.js – butikk, konto, admin, leser, editor | nei (bak proxy) |
| `db` | PostgreSQL 16 (lokalt Docker; Supabase Postgres i production) | nei |
| `storage` | `supabase/storage-api` (lokalt); Supabase Storage i production | nei |
| `redis` | Delt cache for katalogprojeksjoner og uforanderlige publikasjonsfragmenter (`allkeys-lru`, 512 MB) | nei |
| `website-backup` | Cron-jobb (hver 6. time) – database + Storage → S3-kompatibel offsite (Cloudflare R2) | nei |
| `watchdog` | Oppetidsvakt med webhook/heartbeat-varsling | nei |
| Cloudflare Worker | Vedlikeholdsside foran domenet (`maintenance-worker.js`) | ja |

### Nettverks- og tillitsmodell
- Nettleseren er **single-origin**: frontend kaller relative `/api`-stier, ingen CORS i normalstien.
- **Kontrollplan vs. dataplan:** hovedappen kjenner kunde, betaling og rettighet; innholdet leveres direkte fra innholdstjenesten til
  nettleseren med et token. Hovedappen er ikke innholdsproxy.
- **Token:** Ed25519-signerte JWT-er (`EdDSA`) med `kid` og publisert JWKS. Mottakerne validerer lokalt med offentlig nøkkel
  – ingen nettverksoppslag per forespørsel. Lesetoken gjelder én ressurs i 15 min (skrive 60 min, review 5 min).
- **Rettighet ≠ token ≠ produkt:** produkt (det som selges) → `ResourceEntitlement` (varig rett i DB) → kortlivet token.
- Ingen fremmednøkler på tvers av databaser; kobling skjer med stabil UUID (`resource_id`).
- Persondata blir i hovedappen; innholdstjenesten får bare en pseudonym `actor_ref`.
- Innlogging: lokal e-post/passord (bcrypt) → egen HS256-JWT (`JWT_SECRET`). Supabase-tokens aksepteres i tillegg hvis
  `SUPABASE_JWT_SECRET` er satt (auto-provisjonering av bruker). Admin-rolle styres av `ADMIN_EMAILS`.
- Per-IP rate limiting på auth- og KI-ruter. Appen **nekter å starte** i ikke-lokalt miljø med tom/standard `JWT_SECRET`.

---

## 3. Backend (`backend/`)

| Område | Valg |
| --- | --- |
| Språk/runtime | Python ≥ 3.11 (image: Python 3.12), pakkehåndtering **uv** (`uv.lock`, `--locked`) |
| Web-rammeverk | **FastAPI** + Uvicorn |
| ORM | **SQLAlchemy 2 (async)** + **asyncpg** |
| Migrasjoner | **Alembic** (kjøres som Railway `preDeployCommand`: `python -m app.cli schema upgrade`) |
| Validering/config | Pydantic 2, pydantic-settings |
| Auth | PyJWT, bcrypt, `cryptography` (Ed25519) |
| Betaling | **Stripe** (`stripe` SDK), **Vipps MobilePay** (ePayment + Recurring, via httpx) |
| E-post | **Resend** + Jinja2-maler |
| PDF (kvittering/faktura) | **WeasyPrint** (krever Pango/HarfBuzz + fonter i image) |
| KI | **pydantic-ai** mot **OpenRouter** (modellvalg kan overstyres i admin) |
| Lagring | **supabase** Python-klient → Supabase Storage (private buckets) |
| Cache | **Redis** (`redis[hiredis]`) med outbox-basert refresh |
| Annet | httpx, pypdf, markdown-it-py, beautifulsoup4, Pillow, jsonschema, click (CLI), websockets |
| Regnskap (valgfri) | **Fiken** (pluggbar provider, `services/accounting/`) |
| Tester | pytest, pytest-asyncio, pytest-xdist, aiosqlite (in-memory SQLite per test) |

**Moduloppbygging (`app/modules/`):** vertikale slices – `identity`, `commerce`, `catalog`, `subscriptions`, `content`,
`resources`, `courses`, `institutions`, `enola` (KI), `ai`, `aktivitetsplan`, `eksamenstrening`, `authors`, `announcements`,
`support`, `admin`, `operations`, `cache_refresh`, `cross_services`, `service_access`, `manual_testing`, `staging`, `plugins`.
Hver feature mountes bare når `FEATURE_*` er på.

**Mønstre å ta med:**
- Feature flags i to lag (backend `FEATURE_*`, frontend `NEXT_PUBLIC_FEATURE_*`); frontend har én `registry.ts` for gatede ruter/nav.
- Aldri `rollback()` på requestens delte sesjon (utløper identity-map → `MissingGreenlet`); bruk `INSERT … ON CONFLICT DO NOTHING`.
- Seeding ved oppstart (`seed_if_empty`), demokontoer kun i `local/dev/test/ci`.
- Pluginsystem (valgfritt): vendored vertikale slices, av/på i admin ved runtime.

---

## 4. Frontend (`frontend/`)

| Område | Valg |
| --- | --- |
| Rammeverk | **Next.js 16** (App Router, `output: standalone`), **React 19**, TypeScript 5 |
| Stil/UI | **Tailwind CSS v4**, **shadcn/ui** (+ Radix UI), `class-variance-authority`, `tailwind-merge`, `lucide-react`, `sonner` (toasts), `next-themes`, `motion`, `geist`-font |
| Data | **TanStack Query v5**, `zod` |
| Rik tekst/editor | **TipTap 3** (+ tabeller, matte, mentions, bilder, task-lister), `mathlive`, `katex` |
| Markdown | react-markdown, remark-gfm/math, rehype-katex/highlight/raw, unified |
| Regneark / kode | **Univer** (sheets-presets), `xlsx`, **ace** (react-ace) for kodeaktiviteter |
| Diagrammer | Recharts |
| Drag and drop | `@dnd-kit` |
| Sikkerhet | DOMPurify, CSP i `next.config.ts` (connect-src for domenene til eksterne tjenester) |
| Annet | `qrcode.react`, `fflate` |
| Tester | Vitest (enhet), **Playwright** (e2e) |
| Docker | flertrinns: `node:22-alpine` → `npm ci` → `next build` → standalone |

**Struktur:** `app/` (ruter, gruppert i `(app)`, `(auth)`, `(shop)`, `(marketing)`, `(legal)`, `(video)`), `modules/<slice>/`
(speiler backend: `types.ts`, `api.ts`, `components/`, `pages/`), `lib/` (fetch-transport, feature flags, session),
`proxy.ts` (cutover/forhengs-logikk i Next).

---

## 5. Infrastruktur og drift

| Del | Valg |
| --- | --- |
| Lokal kjøring | **Docker Compose** (via `pyt`-CLI-en), Caddy med `tls internal`, egen Postgres + egen storage-api + Redis |
| Production | **Railway** (egne tjenester: backend, frontend, proxy, website-backup; Dockerfile-bygg, `watchPatterns` per tjeneste, healthchecks `/api/health` og `/preview`, `overlapSeconds`/`drainingSeconds` for null nedetid) |
| Database | **Supabase Postgres** (session-pooler) |
| Fil-lagring | **Supabase Storage**, private buckets: f.eks. `receipts`, `profile-avatars`, `assets`, `uploads`, `support-files` (én bucket per filtype; opprettes ved første bruk – la appen lage dem selv, ellers blir de PDF-only) |
| Backup | Cron-tjeneste → offsite S3-kompatibel lagring (Cloudflare R2), restoreøvelse i isolert Postgres |
| Vedlikehold | Cloudflare Worker (`wrangler.toml`) |
| Overvåkning | Watchdog + heartbeat-URL + webhook (Slack/Discord-format) |
| DNS/domene | Cloudflare (hoveddomene + egne underdomener for hver ekstra tjeneste, f.eks. `content.`, `services.`) |
| Release | Gren `production` deployer automatisk; `main` er arbeidsgren. Cutover-modi: `live` / `preview` / `maintenance` |

---

## 6. Nøkler og miljøvariabler

Legende: 🔴 hemmelig (aldri i git/`NEXT_PUBLIC_*`) · 🟡 ikke-hemmelig konfig · ⚪ valgfri (mock uten) · 🟢 påkrevd i production.

### 6.1 Kjerne – påkrevd i production

| Variabel | Type | Hvor får du den | Merknad |
| --- | --- | --- | --- |
| `APP_ENV` | 🟡🟢 | selv | `local` / `production` – styrer seeding og oppstartsvakter |
| `DATABASE_URL` | 🔴🟢 | Supabase → Project Settings → Database (session pooler, port 5432, SSL) | `postgresql+asyncpg://…`. Alembic bruker samme |
| `JWT_SECRET` | 🔴🟢 | generer selv (lang tilfeldig streng) | Signerer app-JWT. Appen nekter å starte uten |
| `FRONTEND_URL` | 🟡🟢 | selv | Brukes i checkout-redirects og e-postlenker |
| `CORS_ORIGINS` | 🟡🟢 | selv | Kommaseparert; tom/lokal-liste i production = feil |
| `ADMIN_EMAILS` | 🟡🟢 | selv | Får admin-rollen automatisk |
| `REDIS_URL` | 🟡 ⚪ | Railway Redis | Tom = cache av |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 🟡 | selv | Standard 43 200 (30 dager) |

### 6.2 Supabase (database + Storage)

| Variabel | Type | Hvor |
| --- | --- | --- |
| `SUPABASE_URL` | 🟡 | Dashboard → Project Settings → API |
| `SUPABASE_ANON_KEY` | 🟡 | samme (offentlig nøkkel) |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔴 | samme – **aldri til nettleseren** |
| `SUPABASE_JWT_SECRET` | 🔴 ⚪ | JWT Settings. Setter du den, aksepteres Supabase-tokens også. Sett den **ikke** lokalt |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 🟡 | frontend build-arg |
| Bucket-navn (`SUPABASE_*_BUCKET`) | 🟡 | har standardverdier |

Lokalt (Docker `storage`-profilen) trengs i stedet: `STORAGE_JWT_SECRET`, `STORAGE_ANON_KEY`, `STORAGE_SERVICE_KEY`
(generer selv; compose nekter å starte uten) – skal **aldri** settes i et utrullet miljø.

### 6.3 Betaling

| Variabel | Type | Hvor |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | 🔴 ⚪ | dashboard.stripe.com/apikeys |
| `STRIPE_PUBLISHABLE_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 🟡 ⚪ | samme |
| `STRIPE_WEBHOOK_SECRET` | 🔴 ⚪ | Webhooks → signing secret (`whsec_…`) |
| `VIPPS_CLIENT_ID`, `VIPPS_CLIENT_SECRET`, `VIPPS_SUBSCRIPTION_KEY`, `VIPPS_MSN` | 🔴 ⚪ | portal.vippsmobilepay.com → Developer. **Alle fire eller ingen** (delvis oppsett avvises) |
| `VIPPS_BASE_URL` | 🟡 | `https://apitest.vipps.no` (test) → `https://api.vipps.no` (live) |
| `VIPPS_WEBHOOK_SECRET`, `VIPPS_RECURRING_WEBHOOK_SECRET` | 🔴 ⚪ | returneres når webhooken registreres |
| `FEATURE_STRIPE`, `FEATURE_VIPPS`, `FEATURE_PAYMENTS`, `FEATURE_SUBSCRIPTIONS` | 🟡 | av/på |

### 6.4 E-post

| Variabel | Type | Merknad |
| --- | --- | --- |
| `RESEND_API_KEY` | 🔴 ⚪ | resend.com/api-keys. Tom = e-post logges bare (`[email:mock]`) |
| `EMAIL_FROM`, `EMAIL_FROM_ORDERS`, `EMAIL_FROM_SUPPORT` | 🟡 | Resends testavsender leverer kun til egen konto til du har verifisert et domene (SPF/DKIM/DMARC) |

### 6.5 KI

| Variabel | Type | Merknad |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | 🔴 ⚪ | openrouter.ai/keys. Tom = mock-svar |
| `OPENROUTER_MODEL`, `OPENROUTER_IMAGE_MODEL`, `OPENROUTER_BASE_URL` | 🟡 | modellvalg kan overstyres i admin |
| `AI_USD_NOK`, `AI_PROVIDER_FEE_FACTOR` | 🟡 | kostnadsbudsjett/kreditter |

### 6.6 Regnskap (valgfritt)

`FEATURE_ACCOUNTING`, `ACCOUNTING_PROVIDER=fiken`, `FIKEN_API_TOKEN` 🔴, `FIKEN_COMPANY_SLUG`, `FIKEN_BASE_URL`,
`FIKEN_INCOME_ACCOUNT`, `FIKEN_VAT_TYPE`, `FIKEN_PAYMENT_ACCOUNT`. Tomme nøkler = eksport logges som `[accounting:mock]`.

### 6.7 Selgeridentitet på kvittering/faktura (ikke hemmelig)

`COMPANY_NAME`, `COMPANY_LEGAL_NAME`, `COMPANY_TAGLINE`, `COMPANY_ORG_NO`, `COMPANY_VAT_REGISTERED`, `COMPANY_EMAIL`,
`COMPANY_PHONE`, `COMPANY_ADDRESS`, `COMPANY_WEBSITE`. **Bytt alle** for den nye nettsiden.

### 6.8 Capability-tokens mot innholds-/ressurstjenester (kun hvis du bygger samme tjenestesplitt)

| Variabel | Type | Merknad |
| --- | --- | --- |
| `RESOURCE_TOKEN_SIGNING_SECRET` | 🔴🟢 | Ed25519-seed som signerer tokens. Bytte krever rotasjon |
| `RESOURCE_TOKEN_PREVIOUS_SIGNING_SECRETS` | 🔴 | kommaseparert liste under rotasjon |
| `RESOURCE_ACTOR_PSEUDONYM_SECRET` | 🔴🟢 | holdes **stabil** ved nøkkelrotasjon |
| `RESOURCE_TOKEN_ISSUER`, `RESOURCE_TOKEN_AUDIENCE`, `RESOURCE_TOKEN_ENVIRONMENT` | 🟡 | issuer = ditt hoveddomene |
| `CONTENT_SERVICE_ENABLED`, `CONTENT_SERVICE_PUBLIC_URL`, `CONTENT_SERVICE_INTERNAL_URL` (generisk navn) | 🟡 | URL-er til innholdstjenesten (offentlig for nettleser, intern for backend) |
| `CROSS_SERVICES_PUBLIC_URL`, `CROSS_SERVICES_INTERNAL_URL`, `CROSS_SERVICES_INTERNAL_TOKEN` | 🟡/🔴 | internt token mellom tjenester |
| `VIDEO_SERVICE_*`, `VIDEO_LIBRARY_PUBLIC_URL` | 🟡 | hvis video-tjeneste brukes |
| `EXTERNAL_RESOURCE_REDIRECT_URIS` | 🟡 | eksakte PKCE-callbacks, ingen wildcard |
| Frontend: `NEXT_PUBLIC_CONTENT_API_URL` (generisk navn), `NEXT_PUBLIC_CROSS_SERVICES_API_URL`, `NEXT_PUBLIC_RESOURCE_AUTHORITY_URL`, `NEXT_PUBLIC_VIDEO_LIBRARY_URL`, `NEXT_PUBLIC_VIDEO_STUDIO_URL` | 🟡 | build-args; brukes også i CSP `connect-src` |

> Hvis den nye nettsiden **ikke** trenger en separat innholdstjeneste, kan hele 6.8 utelates.

### 6.9 Frontend (bakes inn ved *build* – bygg på nytt etter endring)

`NEXT_PUBLIC_API_URL` (tom = same-origin), `API_INTERNAL_URL` (server-side, `http://backend:8000`),
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_ENV`, og `NEXT_PUBLIC_FEATURE_*`
(`LANDING, SERVICES, PAYMENTS, SUBSCRIPTIONS, AI, ADMIN, AUTHORS, COURSES, AKTIVITETSPLAN, MANUAL_TESTING, PLUGINS`).
Aldri hemmeligheter med `NEXT_PUBLIC_`-prefiks. Kun dev: `NEXT_PUBLIC_DEV_AUTOLOGIN`, `NEXT_PUBLIC_DEV_PREFILL_*`.

### 6.10 Cutover / migrering (engangs, kun ved flytting fra gammel plattform)

`CUTOVER_MODE` (`live|preview|maintenance`), `CUTOVER_PREVIEW_SECRET` 🔴, `CUTOVER_INTERNAL_TOKEN` 🔴 (≥ 32 byte, ulike).
`WEBSITE_SOURCE_DATABASE_URL` og `WEBSITE_MIGRATION_SIGNING_KEY` 🔴 skal **bare** finnes i en tidsavgrenset migreringsjobb og
**aldri** i runtime.

### 6.11 Backup og overvåking (egne Railway-tjenester)

| Variabel | Formål |
| --- | --- |
| `DATABASE_URL` | database som sikkerhetskopieres |
| `SOURCE_SUPABASE_URL`, `SOURCE_SUPABASE_SECRET_KEY`, `SOURCE_STORAGE_BUCKETS` | Storage som sikkerhetskopieres |
| `SOURCE_STORAGE_ENDPOINT`, `SOURCE_STORAGE_ACCESS_KEY_ID`, `SOURCE_STORAGE_SECRET_ACCESS_KEY` | alternativ S3-tilgang til kilden |
| `OFFSITE_S3_ENDPOINT`, `OFFSITE_S3_BUCKET`, `OFFSITE_S3_REGION`, `OFFSITE_S3_ACCESS_KEY_ID`, `OFFSITE_S3_SECRET_ACCESS_KEY` | offsite-mål (Cloudflare R2) 🔴 |
| `RESTORE_DATABASE_URL`, `RESTORE_SUPABASE_URL` | mål for restoreøvelse |
| `RESEND_API_KEY` | varsel-e-post fra backup |
| `WATCHDOG_WEBHOOK_URL`, `WATCHDOG_WEBHOOK_FORMAT`, `WATCHDOG_HEARTBEAT_URL`, `WATCHDOG_HEARTBEAT_METHOD` | oppetidsvarsler |
| `EXPECTED_STORAGE_BUCKETS` | forventet bucketliste i backup-sjekk |

### 6.12 Lokal Docker/Compose

`COMPOSE_PROJECT_NAME`, `COMPOSE_PROFILES` (`localdb,storage`, valgfritt `stripe`, `piston`), `HTTPS_PORT`, `FRONTEND_PORT`,
`BACKEND_PORT`, `DB_PORT`, `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`, `CONTENT_API_PORT`, `CONTENT_HTTPS_PORT` (generiske navn),
`CROSS_SERVICES_API_PORT`, `CROSS_SERVICES_HTTPS_PORT`, `STORAGE_EDGE_PORT`, `BACKEND_UPSTREAM`/`FRONTEND_UPSTREAM` (proxy i Railway).

### 6.13 Feature flags (backend)

`FEATURE_PAYMENTS, SUBSCRIPTIONS, STRIPE, VIPPS, AI, ADMIN, LANDING, AUTHORS, EMAIL, ACCOUNTING, COURSES, AKTIVITETSPLAN,
MANUAL_TESTING, PLUGINS`. `FEATURE_EMAIL` tvinges på når payments er på.

---

## 7. Konkrete kontoer/tjenester du må opprette for å replikere

| # | Tjeneste | Brukes til | Påkrevd? |
| --- | --- | --- | --- |
| 1 | **Railway** | hosting av backend/frontend/proxy/Redis/backup | ja (eller tilsvarende) |
| 2 | **Supabase** | Postgres + Storage | ja |
| 3 | **Domene + Cloudflare** | DNS, vedlikeholdsside, R2 for offsite backup | ja |
| 4 | **Resend** | transaksjonsmail (kvitteringer, glemt passord, verifisering) | ja i production |
| 5 | **Stripe** | kortbetaling, abonnement, webhooks | hvis salg |
| 6 | **Vipps MobilePay** | norsk betaling (ePayment/Recurring) | hvis norsk marked |
| 7 | **OpenRouter** | KI-assistent og bildegenerering | hvis KI |
| 8 | **Fiken** | automatisk regnskapsføring | valgfritt |
| 9 | **GitHub** | repo + deploy-trigger fra `production`-gren | ja |

Minimum for en fungerende butikk uten KI/regnskap/innholdstjeneste:
`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `CORS_ORIGINS`, `ADMIN_EMAILS`, `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
(+ `ANON_KEY`), `RESEND_API_KEY`, `STRIPE_*` og/eller `VIPPS_*`, `COMPANY_*`.

---

## 8. Sjekkliste ved replikering

1. Kopier mønsteret **backend (FastAPI) + frontend (Next) + proxy (Caddy) + Postgres + Storage + Redis**; start med `docker compose`.
2. Ta med mock-fallback-prinsippet og `FEATURE_*`-flaggene fra dag én.
3. Sett `APP_ENV=production` og generer *nye* verdier for alle 🔴-nøkler – gjenbruk aldri nøkler fra Pytagoras.
4. Opprett Supabase-prosjekt; la appen selv opprette buckets (unngå PDF-only-fella).
5. Verifiser avsenderdomene i Resend før lansering.
6. Registrer Stripe-/Vipps-webhooks mot din egen `/api/webhooks/...` og lagre signeringsnøklene.
7. Bytt `COMPANY_*` og landing/butikk-innhold.
8. Sett opp backup-tjeneste + R2 og test en restoreøvelse før du går live.
9. Bruk egen `production`-gren som deploy-trigger, og `main` som arbeidsgren.
10. Hopp over de ekstra tjenestene (innhold, services, video – kapittel 6.8) med mindre den nye siden trenger samme innholdsmodell.
