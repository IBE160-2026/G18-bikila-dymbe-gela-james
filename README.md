# G18 — Agentic Programming (Kveldstid over teams)

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon og dokumentasjon av utvikling, testing og kvalitetssikring med KI.

## Medlemmer

- Sena G Bikila
- Aksel Dymbe
- Kelly B Gela
- Joseph James

## Kom i gang

Krever Node 24, eller Node 26 eller nyere (Node 25 støttes ikke).

```sh
npm ci              # installer avhengighetene fra package-lock.json
npm run dev         # start utviklingsserveren
npm run lint        # kjør ESLint
npm run typecheck   # sjekk typene
npm test            # kjør enhetstestene
npm run build       # bygg produksjonsversjonen
npm run preview     # vis produksjonsbygget lokalt
```

### Kartet

Forsiden er et Norgeskart med én sirkel per sted, fargelagt etter SnowScore: grå «Lite» (0–19),
lyseblå «Middels» (20–44), blå «Godt» (45–69) og mørkeblå «Svært godt» (70–100). Et sted med
ufullstendige data er en hul sirkel med stiplet kant. Hold musa over en sirkel for å se navn og
poengsum, og klikk for å åpne stedet. Bakgrunnskartet er Kartverkets topografiske kart, som ikke
krever nøkkel, men som trenger nett for å vise kartbildene.

Velg «Liste» under navigasjonen (eller åpne `/?visning=liste`) for å se de samme stedene som en
liste som virker med tastatur og skjermleser, sortert etter score, avstand eller navn.

### Røyktest i nettleser (E2E)

Playwright-testene i `tests/e2e/` bygger appen, starter `npm run preview` og sjekker kart → stedsside
→ tilbake, listevisningen med tastatur og en axe-sjekk av tilgjengeligheten i Chromium på demodataene.
De henter ingenting fra nett. Nettleseren lastes ned én gang:

```sh
npx playwright install chromium   # last ned Chromium for Playwright (én gang)
npm run test:e2e                  # kjør røyktesten
```

På pull requests kjøres den av `.github/workflows/e2e.yml`. `npm test` kjører bare enhetstestene og
trenger verken nettleser eller nett.

### Demomodus

Et rent klon trenger verken nøkler eller nett. `npm run dev` viser da demodataene i
`public/data/demo.json`, med banneret «Demodata – ikke ekte prognoser». Appen laster
`public/data/latest.json` hvis den finnes, og ellers `demo.json`. `latest.json` lages av
`npm run data` (se under), og committes ikke.

Demodataene er 24 steder med ekte, innspilte MET- og NVE-svar fra `tests/contract/fixtures/`. Ett
sted har ufullstendige data, og ett har kildedata som er eldre enn 3 timer (merkingen «Utdatert» i
appen kommer i Story 1.9). «Nå» i demoen er tidspunktet for de nyeste dataene, så det ser likt ut
uansett når du åpner appen.

```sh
npm run data:demo        # lag public/data/demo.json på nytt fra fixturene (uten nett, gir byte-lik fil)
npm run fixtures:record  # ta opp nye MET- og NVE-svar (krever nett, se tests/contract/fixtures/README.md)
```

### Live-data

```sh
npm run data   # hent MET- og NVE-data for alle stedene i data/catalog.json (krever nett, ingen nøkler)
```

Dataprogrammet henter værprognosen fra MET og nysnø siste døgn fra NVE for hvert sted, sjekker svarene
og regner ut SnowScore. Når minst 95 % av stedene har gyldige data, skrives `public/data/latest.json`,
og `npm run dev` viser da live-data uten demobanner. Fila blir liggende til neste vellykkede kjøring,
så dataene kan være gamle; slett den for å gå tilbake til demodataene.
Under 95 % står forrige fil urørt, og kommandoen avslutter med feilkode 1. Kvalitetsrapporten (hvor
mange steder som har gyldige data, og hvilke svar som ble avvist og hvorfor) ligger i datafila, eller
skrives ut når kjøringen ikke ble publisert.

Feltene i datafila og kildesvarene er beskrevet i
[`shared/contracts/data-dictionary.md`](shared/contracts/data-dictionary.md).

### Stedskatalogen

`data/catalog.json` er lista over de ca. 300 stedene appen viser (skisteder, fjelltopper og byer). Den er committet og endres bare når vi bygger den på nytt for hånd:

```sh
npm run catalog     # bygg data/catalog.json på nytt (krever nett)
```

Skriptet i `scripts/build-catalog/` henter skisteder fra OpenStreetMap og slår opp fjelltoppene og byene i `scripts/build-catalog/seeds.json` hos Kartverket, sammen med høyden. Resultatet sjekkes mot skjemaet `Catalog` i `shared/contracts/catalog.ts` før fila skrives. Feiler en kilde, eller finnes et navn i `seeds.json` ikke, avsluttes skriptet med feil og den gamle fila står urørt. Overpass (OpenStreetMap) er ofte opptatt; da prøver skriptet igjen og bytter speil, og ellers kan du kjøre det på nytt senere. Se over endringene i `data/catalog.json` før du committer dem.

### Sjekk før push

`npm ci` (eller `npm install`) slår på en git-hook, `.githooks/pre-push`, som kjøres hver gang du pusher:

- Push direkte til `main` avvises. Lag en grein og en pull request.
- Har du endringer som ikke er committet, stoppes pushen, slik at sjekkene tester det du faktisk pusher.
- `lint`, `typecheck`, `test` og `build` kjøres, og pushen stoppes hvis én av dem feiler.

Klonet du repoet før hooken kom, slår du den på med `npm run prepare`. Sjekk at den er aktiv med `git config core.hooksPath`; svaret skal være `.githooks`.

GitHub Actions kjører de samme sjekkene (`ci.yml`) på hver PR. Hooken gir deg svaret før du pusher. Den er ikke helt det samme:
- den kjører på din maskin og Node-versjon;
- den tester ikke den flettede tilstanden i pull requesten.

Bare i et nødstilfelle med feilende sjekker kan den hoppes over med `git push --no-verify`. Skriv i så fall i pull requesten hvorfor. Bruk det aldri for å pushe til `main`.

## Dokumentasjon

Prosjektdokumentasjonen ligger i [`project-phase-folders/`](project-phase-folders/), organisert
etter oppstarts-, planleggings-, gjennomførings- og avslutningsfasen. `project-workspace/` er
BMAD-verktøyets arbeidsmappe, ikke gruppens leveranse — se
[`project-phase-folders/README.md`](project-phase-folders/README.md) for hva som ligger hvor.
[`AGENTS.md`](AGENTS.md) inneholder reglene KI-agentene følger i repoet.

## Følg fremdriften

- [`fremdriftsplan.md`](project-phase-folders/2-Planleggingsfasen/fremdriftsplan.md) viser hvor
  vi er, hva som kommer, og hvilken BMad-agent vi bruker i hvert steg.
- [`ai-log/prompter/`](ai-log/prompter/) inneholder promptene vi har brukt, ordrett, én fil per
  økt.
