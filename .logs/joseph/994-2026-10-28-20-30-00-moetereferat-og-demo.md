# Møtereferat og demo

## 2026-10-28 kl. 20:30 — Joseph

### Oppgave
Lage statusside og klikkbar demo av appen, få PR #70 mergebar etter Story 3.8, og skrive møtereferat for 2026-10-28 med fordelingen av arbeidet fram til kodefrys.

### Plan
- Demo: det ekte bygget fra `main` med demodata, som publisert side og som én HTML-fil for `file://`.
- PR #70: flette inn `main` etter #71 og ta 3.8 ut av det som gjenstår.
- Referat etter malen i `møtereferater/README.md`, bygget fra git-loggen og PR-historikken for i dag.
- Fortsetter [milepaeler-og-aktivitetsliste](995-2026-10-28-19-05-00-milepaeler-og-aktivitetsliste.md).

### Resultat
- Statusside: https://claude.ai/artifact/EaW5VDMYfzcy9XEJZjCBNS. Demo: https://claude.ai/artifact/MrEZNpW6BE55jFgWctuLAS. Lokal demofil: `C:\Users\RAM\SnowFinder-demo\SnowFinder-demo.html`, testet med Playwright fra `file://`.
- PR #70: `3acc562` flettet inn `main`, og Aksel merget den. #69 er lukket.
- Greina `docs/møtereferat-2026-10-28`: referatet, ansvarlig i aktivitetslisten (Aksel for 1.11, 1.6 og 4.2, og Joseph og Aksel for P6, P8 og P11) og i fremdriftsplanen (8c, 9 og 10), «Hvor er vi nå?» og KI-loggen. Lint, typesjekk, 572/572 tester og bygg er grønne.

### Åpne punkter
- Be faglærer endre Pages-kilden til «GitHub Actions» og slå på grenbeskyttelse innen 2026-11-04.
- Fristene i milepælene vedtas på neste møte.
