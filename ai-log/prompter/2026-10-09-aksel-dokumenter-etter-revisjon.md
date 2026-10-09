# 2026-10-09: Dokumentene oppdatert etter revisjonen

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-project-context` (refresh av AGENTS.md) og retting av dokumenter som ikke stemte med koden.
**Fase:** Gjennomføring
**Resultat:** AGENTS.md, README.md, `fremdriftsplan.md`, `sprintplan.md`, `milepæler.md`, fase-README-ene, `sprint-status.yaml`, retrospektiven for Epic 2 og `.gitignore`.

## Prompter

### 1
> ja

(Svar på forslaget om å rette rød E2E først og dokumentene deretter. Rød E2E ble rettet i PR #39.)

### 2
> ok

(Godkjenning av forslaget til AGENTS.md.)

**Svar (kort):** Endringer i AGENTS.md:
- I den styrte blokken er pitfallen «Actions er ikke slått på» byttet med regelen om å vente på `gh pr checks`, og det står at E2E ikke kjører i pre-push-hooken.
- Utenfor blokken er §3 skrevet om, og §5-punktet om å be faglærer slå på Actions er slettet.

**Hva vi gjorde med det:**
- README og status-dokumentene er oppdatert, slik at de stemmer med koden og med det som faktisk er bygget.
- Retrospektiven har fått en rettelse om at premisset for tiltak A10 var feil.
- Promptene for tre av Josephs økter 2026-10-07 mangler fortsatt. De kan bare Joseph legge inn.
