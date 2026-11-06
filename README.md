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

**Nettsiden:** <https://snowfinder-seven.vercel.app>

**For sensor:** `npm ci && npm run dev:demo` virker alltid, uten nett og nøkler, og viser det samme hver
gang. `npm ci && npm run dev` viser ekte værdata og krever nett.

```sh
npm ci              # installer avhengighetene fra package-lock.json
npm run dev         # start appen med ekte værdata (krever nett, ingen nøkler)
npm run dev:demo    # start appen med det faste demodatasettet (uten nett og nøkler)
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

Filteret (til venstre på store skjermer, bak knappen «Filter» nederst på mobil) har seks krav:
minst så mye nysnø, høyst så mye vind, høyst så høy temperatur, høyst så mye skydekke i dagslys
(0–100 % i steg på 10, «Alle» ved 100), høyst så langt unna din egen posisjon (0–200 km i steg på 10,
«Alle» ved 200) og stedstype. Stedstype er tre avkrysningsbokser, «Skisted», «Fjelltopp» og «By»: ingen
avkrysset betyr «Alle», og kryss av for å se bare de typene. Fjerner du siste kryss, er stedstypekravet av
igjen.
Skydekket i dagslys er snittet av timene de neste 24 timene der solen står over horisonten
på stedet, og stedssiden viser det i raden «Skydekke i dagslys». I mørketiden finnes ingen slike timer, så
nordlige steder har ingen verdi og skjules når skydekkekravet er på. Kart og liste viser bare stedene som
oppfyller alle kravene. Et sted som mangler verdien for et aktivt krav, vises ikke. «Nullstill» setter alle
kravene tilbake til «Alle». Filteret viser hele tiden antall treff, og ved null treff foreslår appen det ene
kravet som bør lempes (for eksempel «Prøv nysnø minst 12 cm» eller «Prøv uten stedstypekravet»), som du kan
bruke med knappen «Bruk forslaget».
Forslagene bruker sliderens hele steg, så et sted med 12,6 cm nysnø gir forslaget «minst 12 cm».

Rett under nysnø-slideren velger du datagrunnlag for nysnøkravet: «Prognose (MET, neste 24 t)», som er
standard, eller «Siste 24 t (NVE, modellert)». Det siste bruker NVEs døgnverdi for nysnø fra seNorge, for det
sist fullførte døgnet (kl. 06–06 UTC), ikke et glidende 24-timersvindu. Det er
**modellerte estimater, ikke målt snø**. SnowFinder bruker en forenklet omregning der 1 mm vannekvivalent
tilsvarer omtrent 1 cm snø, og faktisk snødybde kan variere. Steder uten NVE-verdi skjules bare når
nysnøkravet er på. Står det på «Alle», har valget ingen effekt, og alle steder vises. Chipen, forslaget ved
null treff og hver rad i listen viser nysnø fra kilden som gjelder, for eksempel «Nysnø siste 24 t 15 cm».
Mangler NVE-data for alle steder i siste kjøring, står det under valget, og på mobil også i banneret ved
null treff. «Nullstill» og hurtigvalgene setter
kilden tilbake til prognosen.

Avstandskravet spør om posisjonen din først når du selv flytter avstandsslideren bort fra «Alle», aldri
automatisk ved lasting eller fra en delt lenke. Posisjonen brukes bare i nettleseren til å regne avstand til
hvert sted; den sendes aldri noe sted og lagres aldri, verken i adressen eller på tjener. Avslår du
forespørselen, eller er posisjonen ukjent av en annen grunn, har kravet ingen effekt — det skjuler ingen
steder, i motsetning til et sted som mangler en verdi — og en tekst under slideren forklarer hvorfor.
Avstandsgrensen selv (ikke posisjonen) er derimot et vanlig filterparameter som ligger i adressen, så en delt
lenke bærer grensen videre uten å be mottakeren om posisjonen før de selv rører slideren. Avstand vises ikke
på kartet eller i listen; den brukes bare til å avgrense treffene.

Når avstandskravet er aktivt, vises knappen «Hele Norge» ved siden av slideren. Den setter bare avstanden
tilbake til «Alle», slik at du kan oppdage de beste snøforholdene i hele landet igjen, uten å trykke
«Nullstill» og dermed også miste nysnø-, vind-, temperatur- og skydekkekravet.

Øverst i det åpne panelet står to hurtigvalg-chips som fyller hele filteret i ett trykk, uten dialog:
«Pudderdag» setter nysnø minst 10 cm, vind høyst 8 m/s og temperatur høyst −2 °C (skydekke settes til
«Alle»), og «Sol etter snøfall» setter nysnø minst 5 cm og skydekke i dagslys høyst 30 % (vind og
temperatur settes til «Alle»). Et krav en chip ikke nevner, også avstand og stedstype, settes alltid til «Alle», uansett hva det
stod på før, så samme chip gir samme resultat hver gang. Chipen vises som valgt når filteret er nøyaktig lik kombinasjonen, og blir det ikke lenger når
du justerer en slider etterpå.

Filteret, visningen og sorteringen ligger i nettadressen, for eksempel
`/?visning=liste&nysno=5&nysnokilde=nve&vind=10&temp=-2&sky=60&avstand=100&type=skisted,by&sortering=navn`.
`nysnokilde=nve` står rett etter `nysno` og tas bare med når «Siste 24 t» er valgt. Valgte
stedstyper står alltid i rekkefølgen skisted, fjelltopp, by, uansett rekkefølgen du krysset av i.
Kopier adressen for å dele søket: lenken åpner samme filter, samme visning og samme treff, men ber ikke om posisjonen din — den spørres
bare ved at mottakeren selv rører avstandsslideren eller velger sortering etter avstand. Krav som står på
«Alle», og ugyldige verdier tas ikke med. Sortering etter avstand lagres ikke, bare avstandskravets egen
grense gjør. Tilbake fra en stedsside viser søket slik du forlot det, og en endring i filteret lager ikke et
nytt steg i historikken.
Stedssidens adresse bærer også søket (for eksempel `/sted/gaustatoppen?visning=liste&nysno=2&temp=0`),
så en delt stedslenke går «Tilbake» til samme søk.

Stedssiden (`/sted/<id>`) viser SnowScore med delpoengene A, B og C, værdataene bak dem og når MET
sist oppdaterte prognosen. Kortet «Beste skivindu» viser fire sammenhengende dagslystimer de neste
48 timene, etter et eventuelt snøfall (Story 4.2). Lavest snittvind avrundet til hele m/s avgjør; skydekket
teller bare ved lik vind, og deretter vinner det tidligste vinduet. Finnes ikke fire sammenhengende timer,
vises det lengste kortere vinduet («Bare N sammenhengende dagslystimer»), og finnes ingen, sier kortet at
det ikke fant noe skivindu de neste 48 timene. Dataprogrammet
regner det ut med `shared/skivindu.ts`, og reglene står i fasittabellen `tests/golden/skivindu.json`.
I mørketid velges vinduet blant alle timer, og kortet sier «Mørketid – vindu vist uten dagslys».
Data eldre enn 3 timer merkes «Utdatert», og steder med data eldre enn
12 timer vises ikke i kartet, listen eller på stedssiden (i demo regnes alderen mot demodatasettets egen «nå»).
Er hele datafila publisert for mer enn 90 minutter siden, står «Viser siste kjente data fra kl. HH:MM» øverst på Utforsk og stedssiden.
Demodataene viser aldri banneret, men en `public/data/latest.json` fra `npm run data` som er mer enn
90 minutter gammel, gjør det.
Er alle stedene for gamle, for eksempel fordi timesjobben har stoppet, viser forsiden «Ingen ferske
data». Kjør da `npm run data` for å hente direkte fra MET og NVE, eller `npm run dev:demo` for
demodataene (se [Demomodus](#demomodus)).

### Slik beregner vi SnowScore

Forklaringssiden (`/slik-beregner-vi-snowscore`) nås fra toppnavigasjonen og fra en lenke ved hver
SnowScore. Den viser hva tallet måler og ikke måler, formelen steg for steg med én graf per delpoeng,
et regneeksempel fra rådata til poengsum, datakilder og lisenser, kvaliteten på siste datakjøring og
endringsloggen for formelen. Kalkulatoren «Prøv selv» er en læringshjelp: tallene i kartet regnes
alltid automatisk fra prognosen.

### Røyktest i nettleser (E2E)

Playwright-testene i `tests/e2e/` bygger appen to ganger: i demomodus for de fleste testene, og i normal
modus for `tests/e2e/normalmodus.spec.ts`, som viser at normal modus aldri leser `demo.json`. Portene 4173 og
4174 må være ledige. Testene sjekker kart → stedsside
→ tilbake, listevisningen med tastatur, filteret (ved 1280 og 375 px), stedssiden, forklaringssiden (også ved 320 og 375 px), den tomme
tilstanden og en axe-sjekk av tilgjengeligheten i Chromium på demodataene.
De henter ingenting fra nett. Nettleseren lastes ned én gang:

```sh
npx playwright install chromium   # last ned Chromium for Playwright (én gang)
npm run test:e2e                  # kjør røyktesten
```

`tests/e2e/slidere.spec.ts` sjekker at de speilede filtersliderne starter på «Alle» til venstre, og at pil
høyre gjør kravet strengere. Nettlesermotorene behandler speilede slidere ulikt, så den fila kjøres også i
Firefox og WebKit (Safari-motoren). Bare den fila kjøres der, ikke hele E2E-pakken:

```sh
npx playwright install firefox webkit   # last ned Firefox og WebKit (én gang)
npm run test:e2e:nettlesere             # slidertestene i Firefox og WebKit
```

På pull requests og ved push til `main` kjøres begge av `.github/workflows/e2e.yml` på Ubuntu, i to jobber ved
siden av hverandre: `e2e` (Chromium) og `nettlesere` (Firefox og WebKit). Fontene der
er bredere enn på Windows, så sjekk at E2E er grønn på GitHub, ikke bare lokalt. `npm test` kjører bare
enhetstestene og trenger verken nettleser eller nett.

### Demomodus

Demomodus må velges, og trenger verken nøkler eller nett. Den viser `public/data/demo.json` med banneret
«Demodata – ikke ekte prognoser». Vanlig modus viser aldri demodata.

```sh
npm run dev:demo                        # utviklingsserveren med demodata
npm run build:demo && npm run preview   # produksjonsbygg med demodata, slik CI, brukertesten og de fleste E2E-testene kjører
```

Bygget som publiseres av timesjobben, inneholder aldri `demo.json`.

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
npm run data:hent   # hent siste publiserte datafil fra grenen data (kjører automatisk før dev og build)
npm run data        # hent MET- og NVE-data selv for alle stedene i data/catalog.json (krever nett, ingen nøkler)
```

`npm run dev` og `npm run build && npm run preview` bruker samme datagrunnlag: `public/data/latest.json`,
som `npm run data:hent` oppdaterer først. Den erstatter fila bare hvis den publiserte er nyere, så en fersk
kjøring av `npm run data` blir stående. Uten nett står den lokale fila urørt. Finnes det ingen fil, sier
appen fra og viser kommandoen for demomodus. Fila committes ikke.

Dataprogrammet henter værprognosen fra MET og nysnø siste døgn fra NVE for hvert sted, sjekker svarene
og regner ut SnowScore. Det sender høyst 10 kall i sekundet til hver kilde, slik MET-vilkårene krever,
så for rundt 300 steder tar hentingen minst et halvt minutt. Et kall som feiler med nettverksfeil, HTTP 429 eller 5xx, prøves inntil tre ganger, med 1 s og så 2 s pause. Når minst 95 % av stedene har fått en poengsum, skrives `public/data/latest.json`,
og `npm run dev` viser da live-data uten demobanner. Fila blir liggende til det finnes en nyere,
så dataene kan være gamle.
Under 95 % står forrige fil urørt, og kommandoen avslutter med feilkode 1. Kvalitetsrapporten (hvor
mange steder som har gyldige data, og hvilke svar som ble avvist og hvorfor) ligger i datafila, eller
skrives ut når kjøringen ikke ble publisert.

### Timesjobben og publisering

`.github/workflows/data.yml` kjører `npm run data` omtrent én gang i timen, ved push til `main` og når den
startes for hånd. GitHub hopper over mange planlagte kjøringer, så timeplanen prøver hvert 10. minutt, og den
første jobben, `gate`, stopper en planlagt kjøring når siste commit på grenen `data` er under 50 minutter
gammel. Loggen til `gate` viser alderen. Actions-fanen får derfor rundt 144 kjøringer i døgnet, og de fleste
har `data`, `branch` og `verify` som skipped. Likevel startet GitHub bare 7 av rundt 290 forsøk på 49 timer, så
hver kjøring på `main` som har hentet, starter `.github/workflows/data-timer.yml` til slutt. Timeren venter til
dataene er rundt 55 minutter gamle (minst 30 minutter etter en avvist kjøring) og starter så `data.yml`. Den står
som «Data timer» i Actions-fanen og venter på en maskin hos GitHub. Bare én timer venter om gangen, og timeplanen
starter kjeden igjen hvis den stopper. Vil dere stoppe kjeden, slå av «Data timer» under Actions. Da får jobben
`timer` en advarsel, men kjøringen blir fortsatt grønn når dataene er publisert. Jobben trenger ingen nøkler. Hver kjøring som henter, legger
`latest.json` i rota på grenen `data`. Grenen har alltid ett commit, så den får ingen historikk som
vokser. Herfra henter `npm run data:hent` fila.

Etter publisering leser jobben fila tilbake fra grenen og nettsiden og sammenligner kjørings-ID-en. Stemmer den
ikke, blir kjøringen rød, så grønn betyr at dataene faktisk er ute.

**Nettsiden** publiseres av Vercel fra `main`, og PR-er får en egen forhåndsvisning. `vercel.json` bygger appen
uten datafiler og sender `/data/latest.json` videre til fila på grenen `data`, så hver timeskjøring når
nettsiden uten nytt bygg. GitHub kan holde fila i opptil fem minutter. Direkte lenker til `/sted/<id>` går til
`index.html`. Vercel trenger ingen nøkler, og prosjektet ligger på kontoen til Aksel. Under **Settings → Git →
Ignored Build Step** står `[ "$VERCEL_GIT_COMMIT_REF" = "data" ]`, så grenen `data` ikke bygges hver time. GitHub
Pages er slått av i emnet.

GitHub slår av planlagte kjøringer etter 60 dager uten aktivitet i repoet. Da viser nettsiden og `npm run dev`
etter hvert «Ingen ferske data», mens `npm run dev:demo` fortsatt virker. Slå på jobben igjen under Actions, og
start den for hånd.

Får under 95 % av stedene en poengsum, krasjer dataprogrammet, eller mangler `latest.json` etter kjøringen,
publiseres ingenting: forrige fil står, også på nettsiden, kjøringen blir rød, og loggen med kvalitetsrapporten
ligger som artifact (`data-run-log`) på kjøringen. En PR som endrer `data.yml`, henter og sjekker uten å
publisere.

Feiler tilbakelesingen, kan den nye fila likevel være ute. Loggen viser hvilken `runId` som var forventet og
funnet, og timeren starter neste kjøring når dataene er rundt 55 minutter gamle.

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
- `lint`, `typecheck`, `test` og `build:demo` kjøres, og pushen stoppes hvis én av dem feiler.

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
