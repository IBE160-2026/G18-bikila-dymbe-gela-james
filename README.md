# G18 — Agentic Programming (Kveldstid over teams)

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon, **SnowFinder**, og dokumentasjon av utvikling, testing og
kvalitetssikring med KI. SnowFinder er en webapp som rangerer rundt 300 steder i Norge etter
prognostiserte snøforhold med en poengsum fra 0 til 100, SnowScore, regnet ut fra værprognosen fra
Meteorologisk institutt.

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

Filteret (til venstre på store skjermer, bak knappen «Filter» nederst på mobil) har fem krav:
minst så mye nysnø, høyst så mye vind, høyst så høy temperatur, høyst så mye skydekke i dagslys
(0–100 % i steg på 10, «Alle» ved 100) og høyst så langt unna din egen posisjon (0–200 km i steg på 10,
«Alle» ved 200). Skydekket i dagslys er snittet av timene de neste 24 timene der solen står over horisonten
på stedet, og stedssiden viser det i raden «Skydekke i dagslys». I mørketiden finnes ingen slike timer, så
nordlige steder har ingen verdi og skjules når skydekkekravet er på. Kart og liste viser bare stedene som
oppfyller alle kravene. Et sted som mangler verdien for et aktivt krav, vises ikke. «Nullstill» setter alle
kravene tilbake til «Alle». Filteret viser hele tiden antall treff, og ved null treff foreslår appen det ene
kravet som bør lempes (for eksempel «Prøv nysnø minst 12 cm»), som du kan bruke med knappen «Bruk forslaget».
Forslagene bruker sliderens hele steg, så et sted med 12,6 cm nysnø gir forslaget «minst 12 cm».

Avstandskravet spør om posisjonen din først når du selv flytter avstandsslideren bort fra «Alle», aldri
automatisk ved lasting eller fra en delt lenke. Posisjonen brukes bare i nettleseren til å regne avstand til
hvert sted; den sendes aldri noe sted og lagres aldri, verken i adressen eller på tjener. Avslår du
forespørselen, eller er posisjonen ukjent av en annen grunn, har kravet ingen effekt — det skjuler ingen
steder, i motsetning til et sted som mangler en verdi — og en tekst under slideren forklarer hvorfor.
Avstandsgrensen selv (ikke posisjonen) er derimot et vanlig filterparameter som ligger i adressen, så en delt
lenke bærer grensen videre uten å be mottakeren om posisjonen før de selv rører slideren. Avstand vises ikke
på kartet eller i listen; den brukes bare til å avgrense treffene.

Øverst i det åpne panelet står to hurtigvalg-chips som fyller hele filteret i ett trykk, uten dialog:
«Pudderdag» setter nysnø minst 10 cm, vind høyst 8 m/s og temperatur høyst −2 °C (skydekke settes til
«Alle»), og «Sol etter snøfall» setter nysnø minst 5 cm og skydekke i dagslys høyst 30 % (vind og
temperatur settes til «Alle»). Et krav en chip ikke nevner, settes alltid til «Alle», uansett hva det
stod på før, så samme chip gir samme resultat hver gang. Chipen vises som valgt når filteret er nøyaktig lik kombinasjonen, og blir det ikke lenger når
du justerer en slider etterpå.

Filteret, visningen og sorteringen ligger i nettadressen, for eksempel
`/?visning=liste&nysno=5&vind=10&temp=-2&sky=60&avstand=100&sortering=navn`. Kopier adressen for å dele
søket: lenken åpner samme filter, samme visning og samme treff, men ber ikke om posisjonen din — den spørres
bare ved at mottakeren selv rører avstandsslideren eller velger sortering etter avstand. Krav som står på
«Alle», og ugyldige verdier tas ikke med. Sortering etter avstand lagres ikke, bare avstandskravets egen
grense gjør. Tilbake fra en stedsside viser søket slik du forlot det, og en endring i filteret lager ikke et
nytt steg i historikken.
Stedssidens adresse bærer også søket (for eksempel `/sted/gaustatoppen?visning=liste&nysno=2&temp=0`),
så en delt stedslenke går «Tilbake» til samme søk.

Stedssiden (`/sted/<id>`) viser SnowScore med delpoengene A, B og C, værdataene bak dem og når MET
sist oppdaterte prognosen. Data eldre enn 3 timer merkes «Utdatert», og steder med data eldre enn
12 timer vises ikke i kartet, listen eller på stedssiden (i demo regnes alderen mot demodatasettets egen «nå»).
Er alle stedene for gamle, for eksempel fordi `latest.json` fra `npm run data` er mer enn 12 timer
gammel, viser forsiden «Ingen ferske data». Kjør `npm run data` på nytt, eller slett
`public/data/latest.json` for å gå tilbake til demodataene.

### Slik beregner vi SnowScore

Forklaringssiden (`/slik-beregner-vi-snowscore`) nås fra toppnavigasjonen og fra en lenke ved hver
SnowScore. Den viser hva tallet måler og ikke måler, formelen steg for steg med én graf per delpoeng,
et regneeksempel fra rådata til poengsum, datakilder og lisenser, kvaliteten på siste datakjøring og
endringsloggen for formelen. Kalkulatoren «Prøv selv» er en læringshjelp: tallene i kartet regnes
alltid automatisk fra prognosen.

### Røyktest i nettleser (E2E)

Playwright-testene i `tests/e2e/` bygger appen, starter `npm run preview` og sjekker kart → stedsside
→ tilbake, listevisningen med tastatur, filteret (ved 1280 og 375 px), stedssiden, forklaringssiden (også ved 320 og 375 px), den tomme
tilstanden og en axe-sjekk av tilgjengeligheten i Chromium på demodataene.
De henter ingenting fra nett. Nettleseren lastes ned én gang:

```sh
npx playwright install chromium   # last ned Chromium for Playwright (én gang)
npm run test:e2e                  # kjør røyktesten
```

På pull requests og ved push til `main` kjøres den av `.github/workflows/e2e.yml` på Ubuntu. Fontene der
er bredere enn på Windows, så sjekk at E2E er grønn på GitHub, ikke bare lokalt. `npm test` kjører bare
enhetstestene og trenger verken nettleser eller nett.

### Demomodus

Et rent klon trenger verken nøkler eller nett. `npm run dev` viser da demodataene i
`public/data/demo.json`, med banneret «Demodata – ikke ekte prognoser». Appen laster
`public/data/latest.json` hvis den finnes, og ellers `demo.json`. `latest.json` lages av
`npm run data` (se under), og committes ikke.

Demodataene er 24 steder med ekte, innspilte MET- og NVE-svar fra `tests/contract/fixtures/`. Ett
sted har ufullstendige data, og ett har kildedata som er eldre enn 3 timer og merkes «Utdatert».
«Nå» i demoen er tidspunktet for de nyeste dataene, så det ser likt ut
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
og regner ut SnowScore. Det sender høyst 10 kall i sekundet til hver kilde, slik MET-vilkårene krever,
så for rundt 300 steder tar hentingen minst et halvt minutt. Når minst 95 % av stedene har fått en poengsum, skrives `public/data/latest.json`,
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

`_bmad/`, `.claude/`, `.agents/` og `.github/agents/` er BMad-verktøyet, installert for hvert av
KI-verktøyene vi bruker. De utgjør det meste av filene i repoet, men er ikke appens kode og
redigeres ikke for hånd. Appen ligger i `src/`, `shared/`, `scripts/`, `tests/`, `data/` og `public/`.

## Følg fremdriften

- [`fremdriftsplan.md`](project-phase-folders/3-Gjennomføringsfasen/fremdriftsplan.md) viser hvor
  vi er, hva som kommer, og hvilken BMad-agent vi bruker i hvert steg.
- [`ai-log/prompter/`](ai-log/prompter/) inneholder promptene vi har brukt, ordrett, én fil per
  økt.
