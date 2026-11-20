# Brukertest-resultater

## 2026-11-19 kl. 22:31 — Aksel Dymbe

### Oppgave
Merge PR #116 (forklaringslenken på mobil), sjekke den publiserte siden, gi status, og føre svarene fra
spørreskjemaet i brukertesten (D1–D6) inn i en PR.

### Plan
- Merge #116 etter grønne sjekker, med kommentar om at den ble merget uten review fra et gruppemedlem.
- Måle den publiserte siden på 375 og 1280 px med Playwright.
- Lese `Nedlastinger/spørreskjema-D1-D6.xlsx`, regne ut SUS og sortere friteksten.
- Fylle ut `resultater.md` og en kopi av `brukertest-svar.xlsx` utenfor repoet, og lage en `docs/`-PR.

### Resultat
- PR #116 merget (aebdf08), og greinen er slettet. CI, E2E og Data var grønne på `main`.
- Live-siden: på 375 px står lenken på linjen med «Best akkurat nå» (48 px høy), og på 1280 px er den bare i
  toppmenyen. Kartet starter på 527 px, så bare ca. 60 px er synlig over Filter-arket på 375 × 667.
- Brukertesten: SUS 87,5 / 87,5 / 87,5 / 92,5 / 85,0 / 92,5, snitt 88,75 (mål ≥ 68). D2 og D3 var først helt like,
  og Aksel rettet D3. Funn: tilbakepilen (D6), værmelding for flere dager (D1, D2), score 0 med gammel snø (D2),
  mange filter (D2), app (D6).
- Greina `docs/brukertest-resultater`:
  - `resultater.md`;
  - fremdriftsplanen, med 19.11, #113 og #114 merget, F4 og steg 10;
  - F4 i `milepæler.md`;
  - ai-log og prompter.
- Den utfylte kopien ligger i `Nedlastinger/brukertest-svar-utfylt.xlsx` (utenfor repoet). Samtykke-kolonnen er
  tom, så «Sammendrag» teller ikke før den er fylt ut.

### Åpne punkter
- Før inn oppgavene O1–O5, tiden, enhet og Safari-sjekken fra observasjonsskjemaene, og vurder SM-2, SM-3 og SM-4.
- Sjekk om D6 testet før eller etter at «Tilbake» ble flyttet øverst (PR #113).
- Kartet er nesten ikke synlig over Filter-arket på små telefoner. Å endre det krever en ny correct-course.
