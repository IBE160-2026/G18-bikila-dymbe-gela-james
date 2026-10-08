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
```

### Demomodus

Et rent klon trenger verken nøkler eller nett. `npm run dev` viser da demodataene i
`public/data/demo.json`, med banneret «Demodata – ikke ekte prognoser». Appen laster
`public/data/latest.json` hvis den finnes, og ellers `demo.json`. `latest.json` skal lages av
dataprogrammet (fra Story 1.5), og committes ikke.

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
og regner ut SnowScore. Til slutt skriver det ut kvalitetsrapporten: hvor mange steder som har gyldige
data, og hvilke svar som ble avvist og hvorfor. Foreløpig skrives ingen fil; `latest.json` kommer i
Story 1.5.

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
