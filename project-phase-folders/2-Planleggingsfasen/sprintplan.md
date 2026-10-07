# Sprintplan

Laget 2026-09-27 i steg 8 av [fremdriftsplanen](fremdriftsplan.md), ut fra
[epics og stories](SnowFinder-Epics-og-Stories.md). Den maskinlesbare statusen for hver story
ligger i
[`project-workspace/implementation-artifacts/sprint-status.yaml`](../../project-workspace/implementation-artifacts/sprint-status.yaml)
og oppdateres når en story endrer status.

## Readiness-sjekk

Resultat: **CONCERNS**. Planen kan bygges, men disse punktene måtte avklares først:

| # | Funn | Hva vi gjorde |
|---|---|---|
| 1 | Story 1.6 krever `banner-stale-data` på Utforsk og stedssiden, som først bygges i 1.7 og 1.9. Det er en avhengighet fremover i tid. | 1.6 er flyttet til etter 1.9. Nummeret er beholdt, så kryssreferanser ikke brytes. |
| 2 | Gruppa har ennå ikke Supabase-prosjekter (dev/prod), Cloudflare Pages eller Turnstile-nøkler. Story 1.3 og utover trenger dem. | Sprint 1 inneholder bare stories som ikke trenger Supabase. Se sjekklisten under. |
| 3 | Hosting er fortsatt en antakelse (Cloudflare Pages). Varslingskanal til gruppa (NFR-6) og Web Push-leverandør er ikke bestemt. | Må avgjøres før henholdsvis sprint 2 (1.6) og sprint 4 (4.4). |
| 4 | NFR-8 (skalerbarhet) har ingen story. | Allerede flagget i PRD §10. Ingen endring. |

## Sprintene

Frister fylles inn i [milepæler](milepæler.md) når gruppa har satt datoer.

| Sprint | Mål | Stories | Forutsetning |
|---|---|---|---|
| 1 | Prosjektet bygger, SnowScore-formelen finnes i kode, og forklaringssiden er på plass | 1.1, 1.4, 1.2, 2.1, 2.2, 2.3, 2.4 | Ingen. Trenger ikke Supabase. |
| 2 | Ekte data på kart, i liste og på stedssiden | 1.3, 1.5, 1.7, 1.8, 1.9, 1.6 | Supabase dev/prod og hosting er satt opp |
| 3 | Filter (Må ha først, deretter Bør ha) | 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8 | Sprint 2 er ferdig |
| 4 | Bør ha: skivindu, PWA, snøvarsel og tilbakemelding | 4.2, 4.1, 4.3, 4.4, 5.1, 5.2 | Web Push-leverandør og Turnstile-nøkler er valgt |

Epic 2 er bygget allerede i sprint 1, fordi forklaringssiden bare trenger SnowScore-modulen
(1.4) og ikke databasen. Lenkene fra kart, liste og stedsside til forklaringssiden kommer
når disse sidene bygges i sprint 2.

### Status i sprint 1 (2026-09-27)

| Story | Status | Merknad |
|---|---|---|
| 1.1 Prosjekt-skaffolding og CI | Spec godkjent (`ready-for-dev`) | Gjennomgått av en underagent. Ni rettelser, blant annet eksakt TypeScript 6.0.3. Ikke implementert ennå. |
| 1.2 Bygg stedskatalogen | Implementert og gjennomgått (`review`) | Fil i stedet for database (arkitektur v4). 300 steder i `data/catalog.json`. Navnelista bør gjennomgås av gruppa i PR-en. |
| 1.4, 2.1–2.4 | Ikke startet | |

## Dette må gruppa sette opp før sprint 2

- [ ] To Supabase-prosjekter, `snowfinder-dev` og `snowfinder-prod` (AD-3)
- [ ] GitHub secrets for Supabase-URL, anon key og service key per miljø. Nøkler committes aldri.
- [ ] Bekreft hosting (Cloudflare Pages eller Vercel) og koble repoet
- [ ] Bestem varslingskanal for pipelinefeil, for eksempel en Discord- eller Teams-webhook (NFR-6)
- [ ] Før sprint 4: Cloudflare Turnstile-nøkkel og valg av Web Push-løsning

## Arbeidsflyt per story

1. Amelia (`bmad-build`) bygger storyen på egen branch, `story/<nummer>-<kort-navn>`.
2. Tester og CI må være grønne.
3. Det åpnes en Pull Request, som merges til `main` når sjekkene er grønne.
4. Statusen oppdateres i `sprint-status.yaml`, og KI-bruken logges i `ai-log/`.
