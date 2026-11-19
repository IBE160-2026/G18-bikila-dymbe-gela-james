# 2026-11-18: gjennomgang av nettsiden og utsatt kodefrys

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-party-mode` med Sally, John, Mary, Winston og Amelia
**Fase:** Gjennomføring
**Resultat:** En liste over forbedringer av nettsiden, sortert etter hva som rekkes. Kodefrysen er
flyttet til 2026-11-28, leveringen til 2026-12-02, og sluttrapporten skrives etter leveringen.
Endret i milepælene, fremdriftsplanen og aktivitetsdiagrammet.

## Prompter

### 1
> hei

**Svar (kort):** Hilsen.

### 2
> gi meg en status

**Svar (kort):** Alle v1-stories er ferdige, og M1 er nådd. Brukertesten (17.–19. november) har
ingen resultater ennå. Sluttrapporten er ikke startet, og fremdriftsplanen ble sist oppdatert
15. november.
**Hva vi gjorde med det:** brukt.

### 3
> gi meg tilbakemeldinger fra bård på prd

**Svar (kort):** Et sammendrag av faglærers tilbakemelding fra 2026-11-12 (`tilbakemelding-prd.md`),
og hvordan hvert punkt ble rettet i PR #99 og #100. De to refleksjonsspørsmålene er ikke besvart
ennå. De kan tas i sluttrapporten.
**Hva vi gjorde med det:** brukt.

### 4
> kan du agentene til å gi meg en oversikt over hva som kan forbedres med nettsiden slik at den ser
> profesjonell ut. ønsker at dette skal være en svært brukervennlig side som mange personer ønsker å
> benytte seg av daglig. https://snowfinder-seven.vercel.app/

**Svar (kort):** Claude tok skjermbilder av den publiserte siden med Playwright, på PC og iPhone.
Agentene fant flere problemer:
- Forsiden svarer ikke på «hvor er det best i dag?».
- Kartet mangler tegnforklaring.
- Tidspunktet for siste oppdatering vises bare på stedssiden.
- Lange stedsnavn brytes midt i ordet.
- Søkefeltet har ingen plassholder.
- Tallene har for mange desimaler, og nysnø vises i både cm og mm.
- SnowScore «0 · Lite» står ved siden av et skivindu på fredag, uten forklaring.

John sorterte forslagene etter kodefrysen. Rettingene kan tas nå. «Best akkurat nå» må gå via
`bmad-correct-course`. Favoritter, «nær meg», minikart og PWA er v2.
**Hva vi gjorde med det:** brukt som grunnlag for rettingene. Sallys ønske om favoritter i v1 ble avvist på grunn av fristen.

### 5
> kondefrysen utsettes med 1 uke

**Svar (kort):** Claude påpekte at 28. november kommer etter leveringen 25. november, og spurte hva som
gjelder. Aksel svarte at leveringen også flyttes, og at omfanget er rettinger pluss «Best akkurat nå».
**Hva vi gjorde med det:** brukt.

### 6
> 2. desember levering. deretter skriver vi sluttrapport

**Svar (kort):** Milepælene, fremdriftsplanen (med tidslinjen) og aktivitetsdiagrammet er oppdatert.
Ny rekkefølge: kodefrys 28.11, generalprøve 1.12, levering 2.12, deretter sluttrapport. Datoene står
som forslag fra Aksel, fordi gruppa og faglærer må bekrefte dem.
**Hva vi gjorde med det:** brukt.

### 7
> ja gruppa har bekreftet de nye datoene. gå deretter videre på steg 2

**Svar (kort):** Datoene er endret fra «forslag» til «vedtatt» i milepælene, fremdriftsplanen og
aktivitetsdiagrammet. Leveringen 2. desember er merket med at faglærer må godta den. Deretter ble
`bmad-correct-course` kjørt, og ett samlet endringsforslag ble skrevet:
`sprint-change-proposal-2026-11-18-best-akkurat-naa.md`.
- Nytt krav: FR-33 (Bør ha).
- Ny story: Story 1.12.
- Nytt krav i SRS-en: SRS-F-35. SRS-F-33 var allerede brukt.
- Valgene i forslaget:
  - raden viser topp 3 av treffene, ikke av alle steder;
  - lik score avgjøres av navnet;
  - steder med ufullstendige data er ikke med;
  - raden skjules ved null treff.
**Hva vi gjorde med det:** brukt.

### 8
> ja godkjent. gjør enedringene og kjør pr

**Svar (kort):** Endringene er gjort i PRD og EXPERIENCE (begge kopiene), epics, SRS (versjon 2.4),
`sprint-status.yaml`, `sprintplan.md` og fremdriftsplanen, i samme PR som datoene.
**Hva vi gjorde med det:** brukt.

### 9
> ja merge. bård har godkjent dette siden det var vi som satt en innlveringsdato

**Svar (kort):** PR #111 merget. PR #112 fører inn at faglærer har godtatt levering 2. desember.
**Hva vi gjorde med det:** brukt.

### 10
> ja merge og start rettingene

**Svar (kort):** PR #112 er merget, og `bmad-build` er startet for rettingene. Claude stilte tre spørsmål:
- desimalene;
- hvor tegnforklaringen skal stå;
- om «Tilbake» skal flyttes.

Aksel valgte de anbefalte svarene og godkjente subagenter til gjennomgangen.
**Hva vi gjorde med det:** brukt.

### 11
> godkjen og fortsett

**Svar (kort):** Rettingene ble implementert og testet. Tre gjennomgangsagenter fant 18 punkter:
- 13 ble rettet, blant annet at navnet og badgen nå står i en egen rad, og at tegnforklaringen er testet på 375 px;
- 5 ble avvist med begrunnelse.

Etterpå var lint, typecheck, 782 enhetstester, `build:demo` og 168 E2E-tester grønne.
**Hva vi gjorde med det:** brukt.

### 12
> ja push. trenger ikke å ta med joseph som reviewer

**Svar (kort):** Greinen ble pushet, og PR #113 ble åpnet uten reviewer. Alle sjekkene i CI var grønne. Claude minnet om at en kode-PR etter gruppas regel trenger godkjenning fra et annet gruppemedlem før merge.
**Hva vi gjorde med det:** brukt.

### 13
> jeg godkjenner. bygg story 1.12

**Svar (kort):** PR #113 ble ikke merget, fordi Aksel er den som bestilte den, og GitHub tillater ikke å godkjenne sin egen PR. Story 1.12 ble bygget med `bmad-build` på en grein oppå #113:
- utvalgsfunksjonen `besteSteder`;
- komponenten `BestAkkuratNaa`;
- enhets-, komponent- og E2E-tester, med axe.

Raden ble flyttet inn i resultatkolonnen, fordi bunn-arket ellers forsvant på korte telefoner.
**Hva vi gjorde med det:** brukt.

### 14
> merge begge nå. jeg godkjenner

**Svar (kort):** PR #113 og #114 er merget. Hver av dem fikk en kommentar om at de ble merget uten godkjenning fra et annet gruppemedlem, som avvik fra AGENTS.md §2. Da greinen til #113 ble slettet, ble #114 lukket. Den ble åpnet igjen med `main` som base.
**Hva vi gjorde med det:** brukt.

### 15
> sjekk at nettsiden er oppdatert

**Svar (kort):** Den publiserte siden viser alle endringene. På iPhone er kartet nesten ikke synlig over bunn-arket.
**Hva vi gjorde med det:** brukt.

### 16
> løs  løses ved å vise «Slik beregner vi SnowScore» bare i menyen på mob

**Svar (kort):** Det endrer akseptkriteriet i Story 2.1b, så `bmad-correct-course` ble kjørt. Claude skrev at FR-8 ikke ble berørt, og det var feil.
**Hva vi gjorde med det:** endringsforslaget ble godkjent, men endret senere (se 18).

### 17
> ja godkjent gjør endringene og lag pr

**Svar (kort):** Lenken ble fjernet med `bmad-build`. Gjennomgangen fant at det bryter FR-8, som krever at forklaringen er lenket, «ikke bare fra toppmenyen».
**Hva vi gjorde med det:** stoppet før commit.

### 18
Valg i dialog: «Flytt lenken til raden (Anbefalt)».

**Svar (kort):** Lenken står nå på linjen med overskriften «Best akkurat nå» under 768 px. Endringsforslaget §7, Story 2.1b, EXPERIENCE.md og kontekstfilene er rettet.
**Hva vi gjorde med det:** brukt.
