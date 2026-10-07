<!-- bmad:context -->
<!-- Verified 2026-10-03 against 6a1e7ff. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## SnowFinder (G18, IBE160)

Gruppeprosjekt i IBE160 ved Høgskolen i Molde: en webapp som rangerer steder i Norge etter prognostiserte snøforhold, med SnowScore (0–100). Planlagt stack: Vite + React + TypeScript, Supabase og GitHub Actions. Ingen kode finnes ennå, og Story 1.1 lager skjelettet. Krav, design og arkitektur ligger i `project-phase-folders/2-Planleggingsfasen/`.

## Policy

- Aldri commit eller push til `main`. Hver story får egen gren `story/<story-id>` og leveres som PR med grønne tester, godkjent av et annet gruppemedlem.
- Logg hver vesentlig KI-økt: én rad i `ai-log/logg.md` (dato, fase, hvem, verktøy/modell, oppgave, endrede/avviste forslag, godkjent av), og promptene ordrett i `ai-log/prompter/ÅÅÅÅ-MM-DD-<navn>-<tema>.md`.
- Svar og skriv nye dokumenter på norsk. Kode, kommentarer og navn i koden skrives på engelsk. Eksisterende engelske dokumenter (arkitekturen, story-specs) redigeres på engelsk.
- Ikke rediger `_bmad/config.toml` (installeren overskriver den). Felles overstyringer går i `_bmad/custom/config.toml`.
- Ikke rediger `.claude/skills/`, `.agents/skills/` eller `.github/agents/` for hånd. De er installert av BMad.

## Where things are

- Stegrekkefølge og status: `project-phase-folders/2-Planleggingsfasen/fremdriftsplan.md`. Oppdater status der når et steg er ferdig.
- Agentrekkefølge: Mary → John → Sally → Winston → John (epics) → sprintplanlegging → Amelia. Planleggingen er ferdig, så nytt arbeid bygges av Amelia (`bmad-build`), én story om gangen, i rekkefølgen i `sprintplan.md`.
- Story-status: `project-workspace/implementation-artifacts/sprint-status.yaml`. Story-specs og epic-kontekst ligger i samme mappe.
- Epics og stories finnes bare i `project-phase-folders/2-Planleggingsfasen/SnowFinder-Epics-og-Stories.md`.

## Running and verifying

- TODO etter Story 1.1: Node 24 og npm; `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Verifiseres ved første refresh etter at koden finnes.
- Lås avhengigheter til eksakte versjoner uten `^`, og commit `package-lock.json`. Bruk TypeScript 6.0.x, ikke 7, fordi typescript-eslint krever <6.1.

## Conventions that differ from defaults

- Planleggingsdokumentene finnes i to like kopier. Endre begge i samme commit:
  - `project-workspace/planning-artifacts/product-brief.md` ↔ `project-phase-folders/1-Oppstartsfasen/SnowFinder-Produktbrief.md`
  - `project-workspace/planning-artifacts/prd-*/prd.md` ↔ `project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md`
  - `project-workspace/planning-artifacts/ux-*/DESIGN.md` og `EXPERIENCE.md` ↔ `SnowFinder-DESIGN.md` og `SnowFinder-EXPERIENCE.md` i `2-Planleggingsfasen/`
  - `project-workspace/planning-artifacts/architecture/architecture-*/ARCHITECTURE-SPINE.md` ↔ `2-Planleggingsfasen/SnowFinder-Arkitektur.md`

<!-- /bmad:context -->

# Prosjektkontekst for agenter

Les denne delen før enhver aktivitet i repoet: planlegging, koding, testing, gjennomgang og
dokumentasjon. Den ligger utenfor `bmad:context`-markørene og overlever derfor
`bmad-project-context`-oppdateringer. Kildene er produktbriefen, PRD-en (prosjektets
kravdokument; det finnes ingen egen SRS), arkitekturen, DESIGN/EXPERIENCE og emnets
sensorveiledning for del 1. Ved konflikt vinner planleggingsdokumentene. Avvik meldes til
gruppa i stedet for å bli tolket bort.

## 1. Slik blir prosjektet vurdert

Del 1 (70 % av karakteren) vurderer både appen og sporene av prosessen i repoet. Hver agent
skal jobbe slik at sporene blir synlige.

| Kriterium | Vekt | Hva agenter alltid gjør |
|---|---|---|
| 1. Prosess og KI-styring | 30 % | Kobler hver endring til en FR, story eller AD. Lager små commits med beskrivende meldinger, én grein og én PR per story. Logger KI-økten (se policy over). Skriver ned når et KI-forslag ble avvist eller rettet, og hvorfor. |
| 2. Funksjonalitet og omfang | 20 % | Bygger Må ha før Bør ha, i sprintplanens rekkefølge. Dokumenterer og begrunner alt som utelates eller endres fra PRD-en. |
| 3. Kvalitetssikring og testing | 15 % | Skriver tester som tester meningsfull logikk (se §6). Bevarer funn fra kodegjennomgangen og hvordan de ble rettet (Review Triage Log i spec-en, kommentarer i PR). |
| 4. Design og brukeropplevelse | 10 % | Følger DESIGN.md, EXPERIENCE.md og tilgjengelighetsgulvet. Bruker bare design-tokens (AD-9). |
| 5. Kodekvalitet og arkitektur | 10 % | Følger mappestrukturen og AD-1–AD-9. Lar ikke død kode eller utkommenterte rester fra forkastede KI-forsøk ligge igjen. |
| 6. README og kjørbarhet | 10 % | Oppdaterer `README.md` når oppsett, kommandoer, miljøvariabler eller mappestruktur endres. Kommandoene må virke på en ren maskin. |
| 7. Ryddighet i repoet | 5 % | Committer aldri hemmeligheter, `.env`, `node_modules/`, `dist/` eller løse testfiler. Ny dokumentasjon legges i riktig fasemappe. |

Sensors varseltegn som agenter aldri skal skape:
- én stor commit med mye kode;
- planleggingsdokumenter som beskriver en annen app enn koden;
- README-kommandoer som ikke virker;
- tester som feiler eller bare tester trivielle ting;
- KI-logg som ikke kan knyttes til konkrete endringer.

## 2. Arkitektur

**Arkitekturstil:**
- **Backend:** Pipes-and-Filters i Supabase Edge Functions. En jobb hver time går gjennom
  stegene fetch → validate → score → stage → publish → alert.
- **Frontend:** en tynn, lagdelt React-klient som bare leser.

Valget er begrunnet slik:
- Hvert steg kan testes alene, og en feil stopper bare sitt eget steg.
- Nettsiden leser bare publiserte data, så den virker videre med siste gyldige data når MET
  eller NVE er nede (FR-6, NFR-4).
- En serverløs løsning gir ingen egen server å drifte for en gruppe på fire med begrenset tid.

Det er **ikke** en modulær monolitt eller mikrotjenester.

**Hovedkomponenter og ansvar** (hver tabell har nøyaktig én skriver, AD-1):

| Komponent | Mappe | Ansvar | Skriver til |
|---|---|---|---|
| Klient (SPA) | `src/` | Sider → komponenter → hooks → `lib/supabase`. Viser kart/liste, stedsside, forklaringsside og tilbakemelding. | Ingenting direkte (kun anon key, RLS) |
| Delt SnowScore-modul | `shared/snowscore.ts` | Den eneste formelen. Brukes av både pipeline og kalkulator (AD-6). | — |
| Pipeline | `supabase/functions/pipeline/` | Henter, validerer, beregner og publiserer atomisk (≥ 95 % gyldige data), og sender varsler (AD-2). | Staging- og publiseringstabeller, `alert_dispatch_log` |
| Følg sted | `supabase/functions/follow/` | Registrerer og fjerner snøvarsler. | `alert_rules` |
| Tilbakemelding | `supabase/functions/feedback/` | Turnstile-verifisert innsending, validert med Zod. | `feedback` |
| Opprydding | `supabase/functions/retention/cleanup.ts` | Den eneste som sletter utløpte data (AD-7). | Sletter |
| Stedskatalog | `scripts/build-catalog/` | Offline-bygging fra OSM og Kartverket til seed-migrering (AD-5). | Migreringer |
| Database | `supabase/migrations/` | Skjema kun via migreringer, med egne dev- og prod-prosjekter (AD-3). | — |

**Ansvar i teamet:**
- Gruppa fordeler epics og komponenter mellom medlemmene i `sprintplan.md`; kolonnen «Ansvarlig» er ikke fylt inn ennå.
- Agenter fordeler ikke personer selv. De skriver hvem som ba om og godkjente arbeidet.

**Dataflyt:**
1. MET og NVE → pipeline (hver time) → `conditions_staging` → atomisk publisering → Postgres.
2. Klienten leser publiserte data via `useSteder()` (AD-8).
3. Skriving går bare via Edge Functions: tilbakemelding og «følg sted».
4. Steget `alert` sender push.
5. `cleanup.ts` sletter data etter de fastsatte fristene.

**Viktige tekniske beslutninger:** AD-1–AD-9 i `SnowFinder-Arkitektur.md` er bindende. Stacken
er låst til Node 24, React 19.3.0, TypeScript 6.0.3, Vite 8.3.0, Vitest 5.0.1, Supabase,
Leaflet 1.9.4, Zod 4, fast-check og Playwright.
- Nye eller endrede beslutninger går gjennom `bmad-architecture` (Winston) og skal begrunnes.
- Planleggingsdokumentene oppdateres i begge kopier (se over).

## 3. UX og wireframes

- **Skjermer i v1** (EXPERIENCE.md): Utforsk (kart og liste er én rute), Stedsside, «Slik
  beregner vi SnowScore» og Tilbakemelding. Toppnavigasjon på alle skjermbredder.
- **Tilgjengelighetsgulv:**
  - WCAG 2.1 AA for alt unntatt selve kartlaget; listevisningen er det fullverdige alternativet.
  - SnowScore vises aldri bare som farge.
  - Alt kan betjenes med tastatur, og trykkmål er minst 44 px.
  - `aria-live` brukes for antall treff.
- **Wireframes mangler:** EXPERIENCE.md sier at ingen mockuper er laget. Sensor ser etter
  skisser og wireframes, så nøkkelskjermene bør skisseres (`bmad-ux`, Sally) før Utforsk
  bygges.

**Kurskravet sammenholdt med SnowFinder (forslag, ikke vedtatt).** Emnet ber om wireframes for
pålogging, profil, innsjekking, sosial feed og arrangementer. PRD-en sier at v1 har ingen
brukerkontoer og ingen sosiale funksjoner (PRD §2.2 og §5, NFR-Privacy). Forslaget er å dekke
hvert punkt med nærmeste skjerm og begrunne avviket ut fra brukernes behov:

| Kurspunkt | Skjerm i SnowFinder | Begrunnelse ut fra brukerbehov |
|---|---|---|
| Pålogging | Utforsk, åpnet uten innlogging | Brukeren vil sjekke forholdene på sekunder. En innloggingsvegg stopper førstegangsbrukere, og ingen konto betyr nesten ingen personopplysninger. |
| Profil | Snøvarsel på stedssiden (FR-18/19) | Personlig tilpasning skjer per sted («varsle meg ved 20 cm»), knyttet til push-abonnementet og ikke til en konto. |
| Innsjekking | Tilbakemelding (FR-27) | Brukeren kan melde fra om faktiske forhold eller feil uten konto. |
| Sosial feed | Utforsk-listen, rangert og oppdatert hver time | Strømmen brukeren trenger er ferske forhold, ikke innlegg fra andre. |
| Arrangementer | Beste skivindu (FR-17) og snøvarsel | «Hendelsen» er når forholdene blir gode, og appen sier fra når den kommer. |

- Gruppa må godkjenne kartleggingen, og helst avklare den med faglæreren.
- Hvis ekte pålogging, profil, innsjekking, feed eller arrangementer kreves, er det en
  produktendring. Den går gjennom `bmad-correct-course` og endrer PRD, UX, arkitektur, epics
  og sprintplan.
- Agenter legger aldri til slike funksjoner på eget initiativ.

## 4. Git-strategi

- **Arbeidsflyt:** `main` er beskyttet.
  - Alt arbeid gjøres på en egen grein og leveres som Pull Request.
  - Et annet gruppemedlem godkjenner, og CI må være grønn før merge.
  - Det gjelder også dokumentasjon.
- **Greiner:**
  - stories: `story/<nummer>-<kort-navn>`, for eksempel `story/1-4-snowscore-modul`;
  - dokumentasjon: `docs/<tema>`;
  - planlegging: `planlegging/<agent>-<tema>`.
  - Én grein og én PR per story. Greinen slettes etter merge.
- **Commits:**
  - Små og avgrensede, på norsk i imperativ («Legg til …», «Fiks …»).
  - Story-nummer i meldingen når det finnes.
  - Aldri én stor «alt er ferdig»-commit.
- **Pull requests:** beskrivelsen lenker til story-spec, FR og AD. Den sier hva som er
  verifisert (kommandoer og resultat) og hva som er utsatt.
- **Kodegjennomgang** skjer i to lag:
  1. Amelias tre KI-gjennomganger (Blind Hunter, Edge Case Hunter, Verification Gap), med funn
     og avgjørelser i spec-ens Review Triage Log.
  2. Et gruppemedlem leser PR-en og kommenterer der. Rettinger av KI-kode skal synes i
     PR-kommentarene eller i loggen.

## 5. Kontinuerlig integrasjon

| Del | Nå (Story 1.1) | Planlagt |
|---|---|---|
| Automatisk bygg | `ci.yml` på hver PR og push til `main`: `npm ci` og `npm run build` (`tsc -b && vite build`) på Node 24. | — |
| Automatiske tester | `npm test` (Vitest, inkludert `theme.test.ts` mot token-drift). | Egenskapstester (fast-check), kontraktstester og Playwright-E2E i `e2e.yml` mot en forhåndsvisning. |
| Kvalitetskontroller | ESLint og typesjekk (`tsc -b`). Eksakte versjoner og `package-lock.json`. | Sjekk av at dokumentkopiene er like; avhengighetsoppdateringer (Dependabot); en CSP-sjekk. |
| Leveransepipeline | Ingen ennå (hosting ikke valgt). | `deploy.yml`: migreringer til Supabase dev på hver PR og til prod etter merge (AD-3); frontend til Cloudflare Pages, som er en antakelse gruppa må bekrefte. |

- Rød CI blokkerer merge.
- Agenter kjører de samme kommandoene lokalt før commit: `npm run lint`, `npm run typecheck`,
  `npm test` og `npm run build`.

## 6. Teststrategi

- **Enhetstester** (Vitest, ved siden av koden som `*.test.ts`, AD-4):
  - SnowScore med egenskapstester: verdien ligger alltid mellom 0 og 100, mer snø gir aldri
    lavere nysnøpoeng, kaldere gir aldri lavere kuldepoeng, og samme inndata gir samme resultat;
  - de enkelte pipeline-stegene;
  - hooks og hjelpefunksjoner;
  - design-tokens.
- **Integrasjonstester:**
  - kontraktstester mot lagrede MET- og NVE-svar i `tests/contract/`;
  - Edge Functions med Zod-validering;
  - sikkerhetstester: klienten kan ikke lese tilbakemeldinger, varselregler eller
    push-abonnementer; RLS blokkerer; fritekst kan ikke injisere kode; ingen hemmeligheter i
    `src/`; avmelding sletter varselregelen.
  - Atomisk publisering og robusthet mot nedetid testes ved å simulere at en kilde er nede (NFR-4).
- **Akseptansetester:**
  - hver story har Given/When/Then-kriterier og en I/O-matrise, og hver matriserad skal ha en
    test som faktisk kjører;
  - Playwright-røyktest kart → filter → stedsside (Må ha);
  - manuell kontroll av faste steder mot MET, og test på mobil og PC;
  - oppgavebasert brukertest med minst fem personer (SM-2, SM-3).
- **Testansvar:**
  - Den som bygger storyen (Amelia på vegne av et medlem) skriver testene sammen med koden.
  - KI-gjennomgangen ser etter verifikasjonshull.
  - Gruppemedlemmet som godkjenner PR-en sjekker at testene tester det kriteriene sier.
  - Hele gruppa gjennomfører brukertesten i avslutningsfasen.
- **Kvalitetskriterier** (Definition of Done fra briefen):
  - Må ha er implementert, testet og dokumentert.
  - SnowScore består egenskapstestene.
  - Forklaringssiden bruker samme modul som pipelinen.
  - Filteret holder kravet om 95 % under 2 sekunder (NFR-1).
  - Tjenesten tåler at én datakilde er nede.
  - CI er grønn.
  - KI-bidrag og menneskelig kvalitetssikring er dokumentert.
- **Minimum hvis tiden blir knapp:** egenskapstester, kontraktstester og én E2E-røyktest.
  Full sikkerhetstest og brukertest er Bør ha-dybde.

## 7. Åpne beslutninger for gruppa

- Godkjenn eller endre UX-kartleggingen i §3, og avklar den med faglæreren.
- Fordel ansvar per epic eller komponent mellom medlemmene, og fyll inn «Ansvarlig» i
  sprintplanen.
- Velg hosting (Cloudflare Pages er en antakelse), varslingskanal (NFR-6) og
  Web Push-leverandør før sprint 2 og sprint 4.
- Lag wireframes for nøkkelskjermene (`bmad-ux`).
- `CONTRIBUTING.md` ligger lokalt hos Joseph og er ikke committet. Avgjør om den skal inn.
  Den sier at sprint-status føres i `3-Gjennomføringsfasen/`, men den ligger i
  `project-workspace/implementation-artifacts/`.
