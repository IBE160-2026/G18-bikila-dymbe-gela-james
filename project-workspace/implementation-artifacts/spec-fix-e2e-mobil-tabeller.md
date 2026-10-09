---
title: 'Rett rød E2E: tabellene på forklaringssiden gjør siden for bred på mobil'
type: 'bugfix'
created: '2026-10-09'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** E2E-sjekken på GitHub har vært rød siden PR #33. Ved 375 px er forklaringssiden 378 px bred i CI (Ubuntu-Chromium), så den ruller sidelengs på mobil. Årsaken er tabellene i regneeksempelet og endringsloggen, som ikke kan krympe under bredden av de lengste ordene. Med bredere fonter blir de for brede. Lokalt med Verdana er det bevist at tabellen går til 381 px. På Windows består testen fordi fontene er smalere, og PR #33–#38 ble merget uten at sjekkene på GitHub var sett.

**Approach:**
- **Tettere celler:** Alle tabeller på forklaringssiden får mindre luft i cellene under 768 px, ikke bare regneeksempelet.
- **Sikkerhetsnett:** Hver tabell ligger i en beholder som kan rulle sidelengs selv (`overflow-x: auto`), så selve siden aldri blir bredere enn skjermen, uansett font. Beholderen kan fokuseres med tastatur og har et tilgjengelig navn, slik axe krever for rullbare områder.
- **Ny E2E-test:** Testen laster siden ved 320 og 375 px med en bred font (Verdana, eller DejaVu Sans der den finnes) og sjekker at siden ikke ruller sidelengs. Da fanger testen feilen også på Windows.
- **Ferdig når:** `gh pr checks` er grønn, også E2E på GitHub.

</frozen-after-approval>

## Implementation Notes

- **Rotårsak:** Tabellene kan ikke krympe under bredden av de lengste ordene, og med fontene i CI (Linux) ble tabellen i endringsloggen fra Story 2.1 for bred. Regneeksempelet i 2.2 gjorde det verre. Lokalt med Verdana gikk tabellen til 381 px. Testen fra 2.1 som sjekker 375 px var riktig. Den består bare på Windows, og PR #33–#38 ble merget uten at sjekkene på GitHub var sett.
- **Endringer:**
  - Begge tabellene ligger i `.forklaring-tabell` med `overflow-x: auto`.
  - Beholderen kan fokuseres (`tabIndex={0}`), har `role="region"` og får navnet fra tabellens `<caption>` (`aria-labelledby`).
  - Tettere celler under 768 px gjelder nå alle tabellene på forklaringssiden.
- **Bevisst avveining:** Beholderen er et tab-stopp og et landemerke også når ingenting ruller. Det gjør at tastaturbrukere alltid når tabellen, og at axe-regelen for rullbare områder er oppfylt, uten at JavaScript må måle bredden.
- **Tester:**
  - Ny E2E ved 320 og 375 px med bred font (Verdana, eller DejaVu Sans på Linux). Den feilet uten rettingen (381 px) og består nå.
  - En ny test sjekker at begge tabellene passer uten indre rulling ved 375 px i sidens egen font, så rullingen bare er et sikkerhetsnett.
- **Første kjøring i CI:** Testen fra 2.1 ved 375 px besto, så siden rullet ikke lenger. Den nye testen for sidens egen font feilte: regneeksempelet var 348 px mot 343 px med DejaVu Sans. Overskriften «Temperatur (°C)» er derfor forkortet til «Temp. (°C)», med `<abbr title="Temperatur">`, slik listen allerede skriver «Temp».
- **Sjekker lokalt:** lint, typecheck, test (366), build og `npm run test:e2e` (27) er grønne. `gh pr checks` sjekkes før merge.

## Review Triage Log

Blind Hunter (oneshot), 10 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Den nye testen fanger ikke tabeller som er for brede, fordi beholderen svelger overløpet | medium | patch | Ny test: begge tabellene passer uten indre rulling ved 375 px i sidens font. |
| 2 | Testen sjekker bare `tabindex`, ikke at beholderen kan nås med tastatur | low | avvist | Fokus er standardoppførsel for `tabIndex={0}`, og axe kjøres på siden. En Tab-sekvens i testen ville bare testet nettleseren. |
| 3 | Beholderen er alltid et tab-stopp og et landemerke | low | avvist | Bevisst avveining, se notatene over. |
| 4 | Navnet er gjentatt i `aria-label` og `<caption>`, og de to har allerede glidd fra hverandre | low | patch | Beholderen bruker nå `aria-labelledby` mot `<caption>`. |
| 5 | Kommentaren finnes på bare én av beholderne | low | patch | JSX-kommentaren er fjernet. CSS-kommentaren forklarer begge. |
| 6 | Spec-en er uferdig | false | avvist | Skrives ved leveringen. |
| 7 | AGENTS.md sier fortsatt at Actions er av | medium | defer | Rettes i neste PR (dokumentene) med `bmad-project-context`, sammen med de andre utdaterte dokumentene fra revisjonen. |
| 8 | KI-logg og sporing mangler | false | avvist | Skrives ved leveringen. |
| 9 | Testen avhenger av at en bred font finnes på maskinen | low | avvist | Verdana følger med Windows, og på Ubuntu-runneren er DejaVu Sans standardfonten, den som utløste feilen. Testen feilet lokalt uten rettingen. |
| 10 | Fokusrammen kan bli klippet | false | avvist | Rammen tegnes rundt beholderen selv, og ingen forelder har `overflow: hidden`. |
