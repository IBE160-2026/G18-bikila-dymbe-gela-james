# 2026-11-08: Merge av de åpne PR-ene etter review

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5)
**Fase:** Gjennomføring
**Resultat:** PR #89–#96 merget til main, og fremdriftsplanen oppdatert i en egen docs-PR. #83 og #85 er ikke merget.

## Prompter

### 1
> er PRD og SRS pushet til git?

**Svar (kort):** Ja, til greinen `docs/prd-srs-v2-2` med PR #96, men ikke merget til main.

### 2
> ja

**Svar (kort):** Claude Code avviste merge-kommandoen fordi PR-en ikke hadde review. Claude forklarte hvordan Aksel kunne merge selv.

### 3
> Gruppa har reviewet. Merge de åpne PR-ene i denne rekkefølgen, én om gangen:
> #89 → #90 → #91 → #92 → #93 → #94 → #95 → #96 → #83 → #85
>
> Story-PR-er: #83, #85, #90, #92, #94. Docs-PR-er: #89, #91, #93, #95, #96.
>
> For hver PR:
> 1. Story-PR-er: sjekk at den har «Approved» fra et annet gruppemedlem på GitHub. Mangler det, hopp over den og si fra. Docs-PR-er trenger bare grønne sjekker.
> 2. Oppdater greinen mot main hvis den er bak, eller hvis basen nettopp ble merget (sett base til main for stablede PR-er: #92 etter #91, #94 og #95 etter #93).
> 3. Flettekonflikter: i ai-log/logg.md, .logs/*/issues.md og sesjonslogger beholder du alle linjene fra begge sider. I DESIGN.md, EXPERIENCE.md, Epics-fila eller kode: stopp og vis meg konflikten før du løser den.
> 4. Vent til alle sjekkene er grønne, og merge så. Slett greinen etter merge.
>
> Ikke gå videre til neste PR før den forrige er merget og main er grønn. Gi meg en kort status etter hver merge.
> Til slutt: sett ferdige stories (bl.a. 3.9) til done i sprint-status.yaml og oppdater fremdriftsplan.md i en egen docs-PR.

**Svar (kort):** Claude merget #89, #90, #91, #92, #93, #94, #95 og #96 i den rekkefølgen. Alle sjekkene var grønne før hver merge, og CI, E2E og Data på main var grønne før neste PR. Hver story-PR hadde «Approved» fra joseph210066. Alle unntatt #89 hadde flettekonflikter mot main. Ingen av konfliktene var i DESIGN.md, EXPERIENCE.md, Epics-fila eller kode. I `sprintplan.md`, `fremdriftsplan.md` og UX-memloggen la begge sider bare til tekst, og Claude beholdt begge sider: nyeste først i «Hvor er vi nå?», ellers i tidsrekkefølge. #83 og #85 har ingen godkjenning og ble hoppet over. Story 1.6b, 3.1b og 2.5 var allerede `done` i `sprint-status.yaml` fra sine egne PR-er. 3.9 ble ikke satt til `done`, fordi #85 ikke er merget.

**Hva vi gjorde med det:** brukt. Fremdriftsplanen ble oppdatert i en egen docs-PR.
