# Sprint Change Proposal: Vercel i stedet for GitHub Pages

**Dato:** 2026-11-01
**Utløst av:** E-post fra faglærer Bård 2026-11-01: GitHub Pages er slått av i grupperepoene, og Vercel er eneste publiseringsløsning emnet støtter.
**Erstatter:** Steg 7 i `sprint-change-proposal-2026-10-31-ekte-data-som-standard.md`, og Pages-delen av steg 4. Resten av det forslaget gjelder fortsatt.
**Modus:** batch, gjennomføres stegvis
**Omfang:** Moderat. Workflow, ny konfigurasjonsfil, krav, arkitektur og README endres. Appkoden endres bare hvis prøven i steg 3 krever det.
**Godkjent:** Aksel (2026-11-01). Gjennomføres stegvis, med godkjenning for hvert steg.

## 1. Problemet

- Pages kommer ikke tilbake, så jobben `pages` i `data.yml`, Pages-lesingen i `verify` og steg 7 blir død kode og ugjort arbeid.
- Vercel bygger bare når `main` endres. Timesjobben skriver til grenen `data`, så en app bygget med en fast `latest.json` får aldri ferske data.
- Vercel bygger hver gren som standard. Grenen `data` har ingen `package.json`, så hver time kan gi et mislykket bygg og en feilmelding til eieren av prosjektet.

## 2. Valg for ferske data

| Alternativ | Nøkkel | Bygg hver time | Appkode | Vurdering |
|---|---|---|---|---|
| **A. `/data/latest.json` proxes til grenen `data` med en rewrite i `vercel.json`** | Nei | Nei | Ingen, hvis prøven holder | **Anbefalt** |
| B. Deploy hook fra `data.yml` | Ja, hemmelig adresse i repoet | Ja | Ingen | Bryter «v1 trenger ingen nøkler» |
| C. Appen leser `raw.githubusercontent.com` selv | Nei | Nei | Ja | Bryter AD-10 v6, men er reserven hvis A ikke virker |
| D. Commit av data til `main` hver time | Nei | Ja | Ingen | Fyller historikken, og bryter regelen om `main` |

Vercels Cron på Hobby-planen er ikke vurdert videre, fordi den er for sjelden for timesdata.

**Med A** leser appen fortsatt én lokal adresse. Grenen `data` er eneste kilde for både `npm run dev` og nettsiden, og den beholder siste gyldige fil hvis en kjøring feiler.

### Må bevises i steg 3

Dokumentasjonen bekrefter at rewrites til eksterne adresser finnes og at Vercel følger `cache-control` derfra. Dette er ikke bekreftet:

1. **Innholdstype:** `raw.githubusercontent.com` svarer `text/plain`, mens `tryFetch` krever `json`. Blir ikke typen overstyrt i `vercel.json`, viser appen «Fant ingen værdata». Da trengs en liten kodeendring som bare avviser HTML.
2. **Statiske filer går trolig foran rewrites**, så `latest.json` må ut av bygget.
3. **Grenen `data`:** det er uklart om `git.deploymentEnabled` leses fra grenens egen commit.

Virker ikke A på en forhåndsvisning, går vi til C og ber om ny godkjenning.

## 3. Konsekvenser

| Område | Konsekvens |
|---|---|
| Konto | Én i gruppa eier prosjektet på sin Hobby-konto. Bare eieren ser Vercel-prosjektet og feilmeldingene. Dette er et godkjent unntak fra regelen om tjenester med konto, gitt av faglærer. Ingen miljøvariabler trengs |
| `data.yml` | Jobben `pages`, Pages-artefakten, sjekken av Pages-API-et, bygget for undermappen og `pages: read` fjernes. `verify` leser grenen `data` og nettsiden |
| `vercel.json` (ny) | Rewrite av datafila, rewrite til `index.html` for direkte lenker, og bygg uten `prebuild` og uten `latest.json` og `demo.json` i `dist/` |
| Grenen `data` | Får ikke bygges på Vercel |
| Freshness | Grenen og Vercel kan begge holde fila i opptil 5 minutter. Det er innenfor 12 minutters fristen i `verify` og 90-minuttersgrensen for banneret. Måles i steg 4 |
| Sensor | `npm ci && npm run dev:demo` er uendret. Nettadressen kommer i tillegg, øverst i README |
| PR-er | Vercel legger en forhåndsvisning i hver PR, som kan brukes i review. CI og E2E er uendret |
| PRD | Det åpne spørsmålet om hosting (linje 796), og FR-30 der Pages er nevnt |
| Arkitektur | AD-10, teknologitabellen, diagrammet, mappeoversikten og kjøremåte-tabellen, i begge kopier |
| Brief | Linja om publisering, i begge kopier. Pages merkes som erstattet, ikke slettet |
| Epics og planer | Story 1.11, sprintplan, milepæler, fremdriftsplan og aktivitetsdiagram |
| README og `AGENTS.md` | Publisering, adressen og regelen om Vercel. `AGENTS.md` endres via `bmad-project-context` |
| Tidsplan | Må være ferdig før timesjobben skal ha gått en uke, altså senest 16. november. Mål: før kodefrys 11. november |

## 4. Implementeringsplan

Hvert steg stopper for godkjenning fra Aksel.

| Steg | Hvem | Innhold | Bevis før neste steg |
|---|---|---|---|
| 1 | Claude | Dokumenter: PRD, arkitektur, brief, epics og planer, som `docs`-PR | Kopiene er like, og sjekkene er grønne |
| 2 | Eieren | Opprett prosjektet etter Bårds oppskrift. Sett straks **Settings → Git → Ignored Build Step** til `[ "$VERCEL_GIT_COMMIT_REF" = "data" ]`: Vercel avbryter ved kode 0 og bygger ved kode 1, så `data` hoppes over | Adressen `.vercel.app` er kjent, og ingen mislykket bygg på `data` |
| 3 | Claude | `vercel.json` og `data.yml` på en story-PR. Prøv forhåndsvisningen | Forhåndsvisningen viser 300 steder med samme `runId` som grenen, og `/sted/gaustatoppen` virker |
| 4 | Joseph og Claude | Review, merge, og kjøring på `main` | Nettsiden og direkte lenke virker, tidspunktet endrer seg etter neste timeskjøring, og `verify` leser nettadressen |
| 5 | Claude | Adressen i README, `AGENTS.md`, status `done` for 1.11, og fremdriften | Faglærer finner adressen i README |

## 5. Beslutning fra Aksel

Aksel eier Vercel-prosjektet (2026-11-01).

## 6. Kilder

- [Git Configuration](https://vercel.com/docs/project-configuration/git-configuration)
- [Rewrites on Vercel](https://vercel.com/docs/rewrites)
- [Ignored Build Step](https://vercel.com/knowledge/how-do-i-use-the-ignored-build-step-field-on-vercel)
