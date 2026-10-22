# 2026-10-22: Rettinger i dataprogrammet etter revisjonen

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-build` (oneshot) med Blind Hunter-gjennomgang i en underagent, én PR per feil.
**Fase:** Gjennomføring
**Resultat:** Retting 1: [`spec-fix-terskel-poengsum.md`](../../project-workspace/implementation-artifacts/spec-fix-terskel-poengsum.md) (PR #43). Retting 2: [`spec-fix-met-hastighet.md`](../../project-workspace/implementation-artifacts/spec-fix-met-hastighet.md).

## Prompter

### 1
> last inn siste endringer

**Svar (kort):** `main` var allerede oppdatert (PR #42 var siste merge).

### 2
> hva er det vi mangler nå?

**Svar (kort):** Claude listet det som gjenstår: Epic 3 (filter), Story 1.11 (timesjobb og publisering), 1.6 og 4.2, tre feil i dataprogrammet fra revisjonen 9. oktober, åpne tiltak fra retrospektiven (A6–A9), Sallys steg 8c og avslutningsfasen.

### 3
> gjør rettingene
>
> (limte inn de tre feilene fra svaret: en kjøring der alle stedene er ufullstendige kan erstatte gode data; ingen grense for hvor ofte MET kalles; dataprogrammet kan bruke gamle NVE-verdier)

**Svar (kort):** Claude fant årsakene i koden og spurte om én ting: hvilken regel som skal stoppe en kjøring der stedene mangler poengsum. Alternativene var: minst 95 % med poengsum (anbefalt), en egen terskel på 50 %, eller bare stopp når ingen har poengsum.

**Valg:** «Minst 95 % med poengsum». Aksel ga også lov til å merge egne PR-er i økten når alle sjekkene på GitHub er grønne.

**Hva vi gjorde med det:**
- **Retting 1:** Terskelen teller steder med poengsum. Rapportfeltet `andelGyldige` beholder betydningen, så datakvalitetspanelet og demodataene er uendret. Brief, PRD, arkitektur, epics, datakatalog og README er oppdatert.
- **Retting 2:** Hver kilde får høyst 10 kall i sekundet (ett kall per 100 ms), halvparten av det MET tillater uten avtale. PRD (FR-2), arkitektur og README er oppdatert.
