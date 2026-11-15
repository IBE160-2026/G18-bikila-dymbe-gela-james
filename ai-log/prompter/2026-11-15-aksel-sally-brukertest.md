# 2026-11-15: status, merge av Story 1.8b og materiell til brukertesten

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), BMad-agent Sally (`bmad-ux`)
**Fase:** Gjennomføring
**Resultat:** PR #83 (Story 1.8b) og PR #102 (status i fremdriftsplanen) merget. Ny mappe
`project-phase-folders/3-Gjennomføringsfasen/brukertest/` med tidsplan, testmanus,
observasjonsskjema og resultatmal. Nye forslag til datoer for brukertest og kodefrys i
fremdriftsplanen, milepælene, aktivitetsdiagrammet og EXPERIENCE.md.

## Prompter

### 1
> hei
> hei

**Svar (kort):** Hilsen og spørsmål om hva vi skulle jobbe med.

### 2
> ja

**Svar (kort):** Fire forslag: bygge neste story, se status, skrive møtereferat eller endre krav.

### 3
> gi meg en status

**Svar (kort):** Epic 1–4 er bygget, og 1.11 står som pågående. PR #83 var godkjent og grønn.
Fristene for kodefrys (11.11) og brukertest (16.11) holder ikke. Ingen testpersoner er rekruttert,
og sluttrapporten er ikke startet.
**Hva vi gjorde med det:** brukt.

### 4
> merge #83  og oppdater statusfilene

**Svar (kort):** PR #83 merget. `sprint-status.yaml` hadde allerede 1.8b som `done`, så bare
fremdriftsplanen ble oppdatert, i PR #102.
**Hva vi gjorde med det:** brukt.

### 5
> ja push og merge 102

**Svar (kort):** PR #102 merget etter grønne sjekker.
**Hva vi gjorde med det:** brukt.

### 6
> lag en plan for brukertesten

**Svar (kort):** Testplanen fantes allerede i EXPERIENCE.md, og fasiten ble sjekket mot
`demo.json`. Claude foreslo tidsplan, roller, fire filer med materiell og nye datoer.
**Hva vi gjorde med det:** brukt.

### 7
> ja sett ig agng

**Svar (kort):** Sally (`bmad-ux`) skrev materiellet og oppdaterte datoene.
**Hva vi gjorde med det:** brukt. Datoen for kodefrys (21.11) var godkjent, men den gamle
milepælen sa at koden fryses *før* testen. Claude delte den derfor i «ingen nye stories etter
16.11» og «kodefrys 21.11 etter rettingene». Gruppa bekrefter datoene på neste møte.
