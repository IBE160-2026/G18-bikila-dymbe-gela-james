# 2026-10-27: PR for 3.7, CI-sjekk og Story 3.8 (nysnø siste 24 timer)

**Hvem:** Sena
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` (dispatch) med tre gjennomgangslag (Blind Hunter, Edge Case Hunter og Verification Gap), to review-runder
**Fase:** Gjennomføring
**Resultat:**
- Greina for 3.7 er pushet, og PR #65 er opprettet med Aksel som reviewer. Den startet ingen CI. Joseph erstattet den med PR #66 (samme commits), som har grønn CI og E2E.
- Spec for Story 3.8 (`spec-3-8-filtrer-pa-nysno-siste-24-timer.md`) er godkjent av Sena med valgene 1A/2A/3A, og med kravet om at NVE-verdiene skal merkes som modellerte.
- Story 3.8 er bygget på greina `story/3-8-filtrer-pa-nysno-siste-24-timer`, laget fra 3.7-commiten `0fe1051`, commit `8b03c46`. Etter review-runde 1 og 2 la Sena til tre valg og to forbedringer. Ikke pushet, ingen PR.
- Fortsetter fra [Story 3.7-økten](2026-10-27-sena-story-3-7-stedstype.md) samme dag.

## Prompter

### 8
> Story 3.7 er klar til å sendes til review.
>
> Push branchen story/3-7-filtrer-pa-stedstype til GitHub, og opprett en pull request mot main.
>
> Følg kravene i AGENTS.md. Beskriv implementeringen, testresultatene, eventuelle avvik og utsatte funn. Referer til Story 3.7 og FR-24.
>
> Ikke merge PR-en. Ikke gjør endringer i Story 3.6 eller PR #63.
>
> Vis meg PR-nummeret, lenken og hvem som er satt som reviewer. Kontroller deretter statusen til GitHub Actions.

**Svar (kort):** Greina ble pushet, og pre-push-hooken var grønn. Claude spurte hvem som skulle ta review, og Sena valgte `aksel007`. PR #65 ble opprettet, men GitHub startet ingen kjøring av CI eller E2E.
**Hva vi gjorde med det:** Brukt. Claude foreslo å lukke og gjenåpne PR-en, men Sena ba om å la den stå.

### 9
> La PR #65 stå åpen foreløpig. Ikke lukk den eller opprett tomme commits.
>
> Undersøk om GitHub Actions er blokkert av tillatelser, godkjenning av workflow eller andre innstillinger. Gjør bare lesende kontroller og rapporter hva du finner.
>
> Deretter ønsker jeg å gå videre til neste ledige story mens vi venter på CI og Aksels review.
>
> Les sprintplanen og finn hvilken story jeg kan starte uten å komme i konflikt med de andre gruppemedlemmenes arbeid. Ikke endre filer før jeg har godkjent oppgaven.

**Svar (kort):** Lesende kontroller fant ingen blokkering: ingen kjøringer som venter på godkjenning, aktive workflows, `write`-tilgang og ingen grenbeskyttelse. Innstillingene for Actions-policy krever administratortilgang. Claude anbefalte Story 1.6, fordi 3.8 var antatt å være Aksels.
**Hva vi gjorde med det:** Rettet i prompt 10.

### 10
> 3.8 er ikke tildelt Aksel. Kelly og jeg skulle jobbe så langt token lot oss. Hvis det var mer å gjøre, skulle han ta derifra. Vi kan jobbe med 3.8 nå hvis den ikke er avh av at 3.7 skal være godkjent. Er 3.8 avhengig av at 3.7 skal være reviewed?

**Svar (kort):** Funksjonelt nei, men 3.8 endrer de samme filene som 3.7. Claude anbefalte å lage greina fra 3.7 for å unngå flettekonflikter.
**Hva vi gjorde med det:** Claude hadde tolket referatet feil. Sena rettet det, og anbefalingen ble brukt.

### 11
> Joseph har erstattet PR #65 med PR #66 for Story 3.7.
>
> Kontroller hvilken grein PR #66 kommer fra, og at den inneholder den ferdige implementeringen av Story 3.7.
>
> Deretter ønsker jeg å starte Story 3.8 fra riktig grein, slik at vi unngår konflikter.
>
> Følg prosjektets AGENTS.md og BMAD-prosess. Opprett en egen grein for 3.8 og utarbeid spesifikasjonen først.
>
> Ikke implementer kode før jeg har gjennomgått og godkjent spesifikasjonen. Ikke endre PR #66 eller main.

**Svar (kort):** PR #66 kommer fra `story/3-7-filtrer-pa-stedstype-pr` og peker på nøyaktig Senas commits. CI og E2E er grønne. Josephs beskrivelse forklarer at GitHub har flagget Senas konto. Greina for 3.8 ble laget fra `0fe1051`, og utkastet til spec hadde tre åpne spørsmål.
**Hva vi gjorde med det:** Brukt.

### 12
> Mine valg er: 1A, 2A, 3A og behold hele spesifikasjonen.
>
> Jeg ønsker også at det skal fremgå tydelig for brukeren at NVEs nysnøverdier er modellerte data, ikke faktiske snømålinger.
>
> Oppdater spesifikasjonen med disse beslutningene og vis meg den endelige versjonen før implementering.
>
> Fortsett å holde Story 3.8 på egen grein, og ikke endre PR #66 eller main.

**Svar (kort):** Valgene og kravet om «modellert» (i etiketten og hjelpeteksten) ble skrevet inn i den frosne intensjonen.
**Hva vi gjorde med det:** Brukt.

### 13
> Jeg godkjenner spesifikasjonen for Story 3.8. Sett den til ready-for-dev og fortsett med implementeringen på den eksisterende 3.8-greinen.
>
> Kontroller spesielt at steder uten NVE-verdi bare skjules når nysnøkravet er aktivt, og ikke når det står på «Alle».
>
> Følg implementeringsplanen, kjør alle relevante tester og gjennomfør kodegjennomgang som for Story 3.7.
>
> Ikke endre PR #66 eller main. Ikke push eller opprett PR før du har vist meg testresultatene og bedt om godkjenning.

**Svar (kort):** Implementert og grønt: 568/568 enhetstester og 109/109 E2E. Kontrollen Sena ba om er dekket av et fasittilfelle, en demodatatest og en E2E-test som gir appen en kopi av demofila der et sted mangler NVE-verdi. Review-runde 1 fant to hull i intensjonen: listen viste prognosen mens filteret brukte NVE, og det fantes ingen melding når NVE manglet overalt.
**Hva vi gjorde med det:** Hullene ble lagt fram for Sena før noe ble rettet.

### 14
> Jeg velger 1A, 2A og 3A.
>
> For spørsmål 3 ønsker jeg denne formuleringen: «NVE-verdiene er modellerte estimater. SnowFinder bruker en forenklet omregning der 1 mm vannekvivalent tilsvarer omtrent 1 cm snø. Faktisk snødybde kan variere.»
>
> Oppdater spesifikasjonen og Code Map, bygg videre på eksisterende implementering og rett de fem mindre funnene.
>
> Kjør deretter alle relevante tester og en ny kodegjennomgang i tre lag. Ikke commit, push eller opprett PR før du har presentert resultatene for meg.

**Svar (kort):** Listen viser nå nysnø fra kilden filteret bruker. Meldingen «NVE-data mangler i denne kjøringen …» vises når NVE mangler overalt. Hjelpeteksten har Senas formulering ordrett, og de fem småtingene er rettet. Review-runde 2 ga 6 rettinger, blant annet at statusområdet nå alltid står i panelet, så skjermlesere annonserer meldingen. To punkter ble lagt fram som valgfrie.
**Hva vi gjorde med det:** Brukt. Claude avvek fra Code Map: listen leser kilden fra den eksisterende propen `sok` i stedet for en ny prop. Avviket er ført i specen.

### 15
> Jeg godkjenner begge de valgfrie forbedringene.
>
> 1. Presiser hjelpeteksten slik at det tydelig fremgår at steder uten NVE-verdi skjules når «Siste 24 t» er valgt og nysnøkravet er aktivt.
> 2. Vis også meldingen om manglende NVE-data i nulltreff-banneret på mobil, uten unødvendig gjentakelse.
>
> Gjennomfør endringene, kjør relevante tester og oppdater dokumentasjonen.
>
> Deretter kan du utføre punkt 1 og 2 under «Gjenstår før PR», inkludert lokale commits. Ikke push eller opprett PR før du viser meg sluttstatus.

**Svar (kort):** Hjelpeteksten er presisert. Banneret viser meldingen bare under 768 px, og bare når null treff skyldes NVE. Fra 768 px står den bare i panelet. Alt er grønt: 572/572 enhetstester og 116/116 E2E. Koden er committet (`8b03c46`), og denne fila, KI-loggen, fremdriftsplanen og sesjonsloggen er oppdatert. 3.8 står som `review`.
**Hva vi gjorde med det:** Brukt. Ikke pushet.
