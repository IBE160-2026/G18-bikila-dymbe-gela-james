# Story 2.1b: logo, én forklaringslenke og slidere fra venstre

## 2026-11-02 kl. 21:00 — Aksel Dymbe

### Oppgave
Aksel ønsket bedre UX på nettsiden:

- logoen ved «SnowFinder»;
- «Slik beregner vi SnowScore» bare én gang;
- sliderne for vind, temperatur, skydekke i dagslys og avstand skal starte til venstre, som nysnø.

### Plan
- Konkret plan godkjent av Aksel. Deretter oppdaterte Sally (`bmad-ux`) DESIGN.md og EXPERIENCE.md, og Amelia (`bmad-build`, oneshot) bygde endringen.
- Spec: [`spec-2-1b-toppnav-og-slidere.md`](../../project-workspace/implementation-artifacts/spec-2-1b-toppnav-og-slidere.md)

### Resultat
- **Logo:** står i toppnavigasjonen, dekorativ (`alt=""`).
- **Forklaringslenken:** vises i toppnavigasjonen fra 768 px, og ved Kart/Liste under 768 px. Aksel valgte dette etter at gjennomgangen viste at Story 2.1 krever lenke fra kart og liste.
- **Sliderne:** de fire «høyst»-sliderne speiles med `dir="rtl"`, så alle fem starter på «Alle» til venstre. Verdiene, adressene og tekstene er uendret.
- **Commits:** `f5764e3` (UX) og `8b25f31` (kode, tester og dokumenter).
- **Sjekker:** lint, typecheck, 666 enhetstester, `build:demo` og 129 av 129 E2E er grønne lokalt.
- **Gjennomgang:** av 11 funn ble 9 rettet, 1 utsatt og 1 avvist.

### Åpne punkter
- Prøv de speilede sliderne i Firefox og Safari i brukertesten. Playwright kjører bare Chromium.
- PR-en for 2.1b trenger review fra et gruppemedlem før merge.
