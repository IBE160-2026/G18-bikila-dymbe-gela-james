# 2026-10-31: Status, review av PR #77 og Story 1.11

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5) i VS Code, `bmad-review` (tre linser), `bmad-build` (Amelia, dispatch) med subagenter for implementering og tre gjennomgangslag, `bmad-correct-course`
**Fase:** Gjennomføring
**Resultat:** Statusoversikt, review-kommentar på PR #77, `data.yml`, lesing av grenen `data` under `npm run dev`, testbar exit-kode, FR-30 og AD-10 endret, status og tidslinje rettet

## Prompter

### 1
> gi meg en status på hva som er gjort og hva som nå mangler?

**Svar (kort):** 23 av 24 v1-stories var ferdige. 1.11 var ikke startet, og brukertesten og sluttrapporten gjensto. PR #77 manglet review, og API-et viste verken Pages eller grenbeskyttelse.
**Hva vi gjorde med det:** Brukt som utgangspunkt for neste prompt.

### 2
> Pages-kilden og slå på grenbeskyttelse er nå gjort av faglærer sjekk om dette er i orden. PR #77 (Story 1.6) mangler review: du merget den uten godkjenning, og Joseph har bedt deg se over den i etterkant. GitHub viser fortsatt ingen review. ta en review av dette og legg in en kommentar før en igjen merger. gå deretter videre på neste steg slik at vi blir ferdige

**Svar (kort):** Innstillingene var ikke i orden: `has_pages: false`, nettstedet ga 404, og `main` var ikke beskyttet. Reviewen fant fire ting som bør rettes og noen testhull, men ingenting som krever revertering. Claude regnet ut og kjørte kontrasten og tidsavbruddet selv før kommentaren ble lagt inn.
**Hva vi gjorde med det:** Kommentaren er lagt inn. Rettingene er bedt om fra Joseph i en egen `fix`-PR. Spec for 1.11 ble skrevet slik at jobben virker både med og uten Pages.

### 3 (valg i `bmad-build`)
> Spørsmål: Hvordan skal appen få tak i dataene på grenen `data`? Svar: «Appen leser selv». Spørsmål: Godkjenner du spec-en? Svar: «Godkjenn og bygg».

**Svar (kort):** Claude hadde anbefalt en egen kommando, men Aksel valgte at appen leser fila selv. Claude bygde det slik at bare `npm run dev` leser grenen, at enhver feil gir demodata, og at en fil over 12 timer gir demodata.
**Hva vi gjorde med det:** 18 funn fra de tre gjennomgangslagene: 12 rettet, 2 utsatt og 4 avvist. Se spec-ens vurderingslogg.

### 4 (valg i `bmad-correct-course`)
> Spørsmål: Godkjenner du endringsforslaget for FR-30 og AD-10? Svar: «Godkjenn».

**Svar (kort):** Valget i prompt 3 var i strid med FR-30, så PRD, epics og arkitektur måtte endres.
**Hva vi gjorde med det:** Lagt inn i begge kopier av PRD og arkitektur, og i epics, i samme PR.

### 5 (etter rundebordet)
> kan du få agentene til å snakke sammen for å finne feil og evt komme med forbedringer slik at dette blir topp

**Svar (kort):** Rundebordet (`bmad-party-mode`) leste koden og fant at testplanen krever demodata, mens `npm run dev` i PR #78 kan vise ekte data. Det var Claudes feil: det første endringsforslaget sa at UX ikke ble berørt.
**Hva vi gjorde med det:** Aksel fikk to alternativer: beholde lesingen med en ny testkommando, eller egen kommando.

### 6
> Jeg velger alternativ B, men med følgende presiseringer: npm run dev skal vise ekte værdata som standard. Demodata skal bare brukes når demomodus aktiveres eksplisitt. npm run data:hent skal oppdatere værdata uten at brukeren må gjøre dette manuelt i den publiserte appen. npm run build && npm run preview og npm run dev skal bruke samme datagrunnlag ved normal drift. Generalprøven 12. november skal gjennomføres med et fast, dokumentert testdatasett for å sikre reproducerbare resultater. FR-30, AD-10, testplanen og arkitekturdokumentasjonen skal oppdateres slik at de samsvarer. Ingen endringer skal merges før relevante tester er bestått. Viktig: Prioriter også GitHub Actions og GitHub Pages. Publisering må verifiseres ved å kontrollere at den faktiske nettsiden oppdateres, ikke bare at workflowen viser grønn status. La rundebordet oppdatere endringsforslaget og presentere konsekvensene før implementering. En ekstra anbefaling: Ikke la Claude Code gjennomføre alle foreslåtte endringer automatisk. Be først om en konkret implementeringsplan, og godkjenn endringene stegvis. Da reduserer dere risikoen for å ødelegge funksjonalitet som allerede fungerer, særlig så tett opp mot generalprøven 12. november.

**Svar (kort):** Claude påpekte at dette ikke er alternativ B, men en ny løsning, at planen har brukertest 12. november og generalprøve 24. november, og at standardkommandoen nå avhenger av timesjobben. Nytt endringsforslag med åtte steg.
**Hva vi gjorde med det:** Godkjent (prompt 7 og 8). Claude foreslo at `data:hent` kjører automatisk, og at appen bare leser én lokal fil.

### 7
> ja fortsett med valgene

**Svar (kort):** Steg 0: PR #78 satt til utkast, og endringsforslaget committet.
**Hva vi gjorde med det:** Meldinger til Joseph og Bård skrevet for Aksel å sende.

### 8
> ja

**Svar (kort):** Steg 1: FR-30, SM-14, AD-10, epics, testplan, generalprøve og README oppdatert. Koden er ikke endret ennå.
**Hva vi gjorde med det:** README beskriver kommandoer som bygges i steg 2, så PR #78 står som utkast til da.

### 9
> ja på begge

**Svar (kort):** `AGENTS.md` oppdatert med sensorregelen og grenen `data`. Steg 2 startet uten å vente på svar fra Bård.
**Hva vi gjorde med det:** Spec-en `spec-1-11b-ekte-data-som-standard.md` ble skrevet.

### 10 (valg i `bmad-build`)
> Spørsmål: Godkjenner du spec-en for steg 2? Svar: «Godkjenn og bygg».

**Svar (kort):** Appen laster nå bare én fil, og `npm run data:hent` kjører før `dev` og `build`. Tre gjennomgangslag: 5 funn rettet, 3 utsatt, og resten avvist. Se spec-ens vurderingslogg.
**Hva vi gjorde med det:** Prøvd i Chromium: `npm run dev` viser meldingen om manglende data, siden grenen `data` ikke finnes ennå, og `npm run dev:demo` viser 24 steder med demobanner.
### 11
> ja

**Svar (kort):** Steg 3 startet. Spec-en `spec-1-11c-e2e-mot-demomodus.md` avviker fra planen: rutene for `latest.json` fjernes, og E2E får et eget bygg i normal modus.
**Hva vi gjorde med det:** Aksel svarte «Godkjenn og bygg».

### 12
> puch inn i git etterpå

**Svar (kort):** Tre gjennomgangslag: 4 funn rettet, 1 utsatt (`AGENTS.md`), og resten avvist. Normal-bygget kjører nå selve `npm run build`, for ellers kunne feil modus nådd produksjon med alt grønt. Commit og push til `story/1-11-timesjobb-og-publisering`.
**Hva vi gjorde med det:** 657 enhetstester og 127 E2E-tester grønne lokalt, og tre mutasjoner gir rødt.
### 13
> gi meg en status på prosjektet akkuratt nå

**Svar (kort):** Claude fant at Joseph hadde godkjent PR #78 og tatt den ut av utkast før steg 4 var gjort, og ba om at den ikke ble merget ennå.
**Hva vi gjorde med det:** Steg 4 ble neste oppgave.

### 14
> Ja godkjenn og gå videre

**Svar (kort):** Spec-en `spec-1-11d-publisering-med-tilbakelesing.md`: grenen `data` skrives alltid, og en egen jobb leser tilbake og sammenligner `runId`.
**Hva vi gjorde med det:** Aksel svarte «Godkjenn og bygg». Tre gjennomgangslag: 6 funn rettet, 2 utsatt, og resten avvist. Viktigst: kjøringen kunne bli grønn uten publisering.

### 15
> bra oppdater i git

**Svar (kort):** Commit og push etter at funnene var sortert.
**Hva vi gjorde med det:** Pushet til PR #78.
### 16 (valg i `bmad-project-context`)
> Spørsmål: Skal disse endringene skrives i AGENTS.md? Svar: «Skriv endringene».

**Svar (kort):** Fire linjer i `AGENTS.md` følger nå `build:demo`, de to E2E-byggene og `data.yml`. Ingen regler er fjernet.
**Hva vi gjorde med det:** Pushet til PR #78.

### 17
> ja. og hvor mang esteg er det?

**Svar (kort):** Åtte steg, nummerert 0–7. PR-beskrivelsen er oppdatert, og Joseph er bedt om ny review.
**Hva vi gjorde med det:** Claude skrev en melding til Joseph for Aksel å sende.

### 18
> gå videre

**Svar (kort):** PR #78 var allerede merget fra Aksels konto, uten ny review av steg 4. Claude sa fra om det og gjorde steg 6: kjøringen på `main` er grønn, `runId` stemmer, og et rent klon viser ekte data.
**Hva vi gjorde med det:** Joseph bes se over `data.yml` i etterkant.

### 19
> kan ikke du ta timesjobben?

**Svar (kort):** Claude startet `data.yml` for hånd. Den ble grønn, og adressen viste den nye fila etter omtrent tre minutter. Det beviser ikke timeplanen, så den overvåkes for seg.
**Hva vi gjorde med det:** Godtatt.

### 20
> kjør dette

**Svar (kort):** Claude tolket det som resten av det som kan gjøres nå: denne `docs`-PR-en og sletting av story-grenen.
**Hva vi gjorde med det:** Pushet som egen PR.
### 21
> (E-post fra faglærer Bård, limt inn av Aksel: alle grupperepoene er koblet til Vercel, som er eneste publiseringsløsning emnet støtter. GitHub Pages er slått av i grupperepoene. Bare én i gruppa oppretter prosjektet, på sin Hobby-konto. Endringer i `main` publiseres automatisk, PR-er får forhåndsvisning, repoet må være offentlig, og adressen skal stå i README. Alle anbefales å installere GitHub CLI.)

**Svar (kort):** Claude fant at Vercel bare bygger når `main` endres, så dataene ville blitt stående, og at grenen `data` kan gi et mislykket bygg hver time. Claude foreslo en rewrite i `vercel.json` i stedet for en deploy hook med nøkkel, og sa at det må prøves på en forhåndsvisning.
**Hva vi gjorde med det:** Aksel godkjente endringsforslaget og valgte å eie prosjektet. Claude rettet selv kommandoen for Ignored Build Step, som først ville bygget feil gren.
### 22
> Følg faglærerens instruksjoner og klargjør SnowFinder for publisering på Vercel. [...] Behold GitHub Actions-jobben som oppdaterer værdata automatisk hver time. Fjern bare den delen av `data.yml` som gjelder publisering til GitHub Pages. [...] Ikke push eller merge endringer før kontrollene er gjennomført og resultatene er oppsummert.

**Svar (kort):** `vercel.json` og `data.yml` endret lokalt, og alle sjekkene kjørt.
**Hva vi gjorde med det:** Godtatt, og fulgt av prompt 23.

### 23
> Jeg ønsker at du automatiserer oppsettet og publiseringen av SnowFinder på Vercel [...] Be om min godkjenning før produksjonspublisering, push eller merge.

**Svar (kort):** Claude installerte Vercel CLI, opprettet og koblet prosjektet `snowfinder`, og kjørte `vercel deploy`. Vercel gjorde den første publiseringen til produksjon, uten godkjenningen Aksel ba om, og Claude sa fra med en gang.
**Hva vi gjorde med det:** Nettsiden er prøvd på ekte, og den fikk en ny `runId` uten nytt bygg.

### 24
> Set up Vercel for me. Fetch https://vercel.com/get-started.md and follow it.

**Svar (kort):** CLI-delen var gjort. Plugin og MCP-server ble stoppet av sikkerhetsregelen i Claude Code, fordi de endrer Claudes eget oppsett.
**Hva vi gjorde med det:** Valget ligger hos Aksel. Publiseringen trenger dem ikke.
