# 2026-11-04: Gjennomgang av PRD/SRS v2 og søk på stedsnavn (Story 3.9)

**Hvem:** Aksel
**Verktøy / agent:** Claude (Opus 5.5) i claude.ai med tilgang til repoet, `bmad-correct-course` og `bmad-build`. ChatGPT ble brukt av Aksel for en annen vurdering, se prompt 2.
**Fase:** Gjennomføring
**Resultat:** Gjennomgang av utkastet `SnowFinder-PRD-og-SRS.html` med en rettet versjon 2, endringsforslaget `sprint-change-proposal-2026-11-04-sok.md`, FR-32 og UJ-4 i PRD, Story 3.9 i epics, søkefeltet i EXPERIENCE.md, og fargeforklaringen for kartet ført som utsatt arbeid.

## Prompter

### 1
> Hei, kan dere se på kravspecsene samt PRD og komme med inspill? Det er i HTML format. vedkommende i gruppen lurer på Forresten lurer jeg på om vi kan ha en front-end som er søkbar istedet for å bare trykke på kartet.

Vedlegg: `SnowFinder_PRD_og_SRS.html` (utkast til ny PRD og SRS, ikke committet).

**Svar (kort):** Claude anbefalte søk på stedsnavn som Må ha i tillegg til kart og liste, fordi tre av fem oppgaver i brukertesten ber deltakeren finne et bestemt sted. Andre funn: SnowScore gjelder neste døgn mens UJ-1 handler om helgen, filterverdiene var ikke definert, kartet mangler fargeforklaring, og NFR-1 (2 s) tester ingenting reelt.

**Hva vi gjorde med det:** brukt, se 3.

### 2
> chat gpt skrev dette: Ja, jeg er enig i forslaget. SnowFinder bør ha et søkefelt i tillegg til kart og liste. […]

Aksel limte inn hele vurderingen fra ChatGPT: enig i søk som Må ha, med et forslag til F3.4 og SRS-F-32 og en liste over hva som må lukkes før dokumentet godkjennes.

**Svar (kort):** Claude var enig i hovedpunktet, men pekte på tre ting: søket må vise steder som filteret skjuler, punktene om ID-kollisjoner var allerede rettet i reviewen, og helg/neste døgn og filterdefinisjonene manglet.

**Hva vi gjorde med det:** brukt som innspill til 3.

### 3
> lag en fullstendig oppsett som er 10 av 10

**Svar (kort):** Claude leste koden (`shared/filter.ts`, `shared/snowscore.ts`, `src/hooks/useSteder.ts` og Utforsk) og laget versjon 2 av HTML-dokumentet. Endringene: søk (F3.4, SRS-F-32), filterdefinisjoner hentet fra koden, UJ-1 flyttet til fredag, fargeforklaring, tom tilstand, skjerpet NFR-1, og en endringslogg. Claude fant også at alle interne lenker pekte til `file:///C:/Users/…` og at alle fanene ble vist samtidig, og rettet begge deler.

**Hva vi gjorde med det:** brukt. Tre punkter er merket «til beslutning» for gruppa: søk som Må ha, valg av dag ikke i v1, og skala som arkitekturforsikring.

### 4
> gjør endringene

**Svar (kort):** Claude spurte hva som menes. Aksel valgte «Bygg i koden + PR». Claude fikk ikke pushe til repoet fra økta, så endringene leveres som patch.

### 5 (valg)
> Spørsmål: Hvordan dele søk og fargeforklaring? Svar: «Søk først (Anbefalt)». Spørsmål: Nye krav skal gjennom `bmad-correct-course` først. Svar: «Correct-course først (Anbefalt)». Spørsmål: Underagenter til kodegjennomgang? Svar: «Ja, bruk dem (Anbefalt)».

### 6 (valg)
> Spørsmål: Modus for endringsforslaget? Svar: «Samlet (Anbefalt)». Spørsmål: Prioritet for søket? Svar: «Må ha (Anbefalt)».

**Svar (kort):** Claude skrev endringsforslaget. Da Claude leste `useSteder.ts`, viste det seg at steder med data eldre enn 12 timer fjernes før Utforsk får dataene. Søket viser dem derfor ikke, slik NFR-3 krever. Det avviker fra SRS-F-32 i v2, og avviket står i forslaget.

### 7 (valg)
> Spørsmål: Godkjenner du endringsforslaget? Svar: «Godkjenn og bygg»

**Svar (kort):** PRD, epics, EXPERIENCE.md (begge kopier), sprint-status, sprintplan og deferred-work ble oppdatert på grenen `docs/endringsforslag-sok`.
