# Sprintplan

Laget 2026-09-27 i steg 8 og oppdatert 2026-10-07 i steg 8d av [fremdriftsplanen](../3-Gjennomføringsfasen/fremdriftsplan.md), ut fra
[epics og stories](SnowFinder-Epics-og-Stories.md). Den maskinlesbare statusen for hver story
ligger i
[`project-workspace/implementation-artifacts/sprint-status.yaml`](../../project-workspace/implementation-artifacts/sprint-status.yaml)
og oppdateres når en story endrer status.

## Readiness-sjekk (v3, 2026-10-07)

Oppdatert etter forenklingen uten Supabase (steg 8d). Resultat: **CONCERNS**. Planen kan
bygges, men disse punktene er kjent:

| # | Funn | Hva vi gjør |
|---|---|---|
| 1 | UX-dokumentene (EXPERIENCE.md og DESIGN.md) var ikke oppdatert etter forenklingen. | Løst: Sally (`bmad-ux`) oppdaterte dem i PR #21. |
| 2 | Story 1.11 publiserer til GitHub Pages, og Pages kan bare slås på av en administrator (faglærer). GitHub Actions er allerede på, og CI kjører på PR-er. | Be faglærer slå på Pages. Reserve: jobben publiserer bare datafila til grenen `data`, og appen leser den derfra (står i Story 1.11). |
| 3 | Story 1.6 krever `banner-stale-data` på Utforsk og stedssiden, som først bygges i 1.7 og 1.9. | 1.6 bygges etter 1.9. Den er nå Bør ha. |
| 4 | NFR-8 (skalerbarhet) har ingen story. | Allerede flagget i PRD §10. Ingen endring. |

Funnene fra 2026-09-27 om Supabase-prosjekter, Turnstile, Web Push og varslingskanal er
borte, fordi de delene er tatt ut av v1.

## Sprintene

Frister fylles inn i [milepæler](milepæler.md) når gruppa har satt datoer.

| Sprint | Mål | Stories | Forutsetning |
|---|---|---|---|
| 1 | Prosjektet bygger, SnowScore-formelen og katalogen finnes i kode, appen kjører med demodata, og forklaringssiden er på plass | 1.1, 1.2, 1.4, 1.10, 2.1, 2.2, 2.3, 2.4 | Ingen |
| 2 | Ekte data på kart, i liste og på stedssiden | 1.3, 1.5, 1.7, 1.8, 1.9, 1.11 | UX-dokumentene er oppdatert |
| 3 | Filter (Må ha først, deretter Bør ha) | 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8 | Sprint 2 er ferdig |
| 4 | Bør ha: robusthet og skivindu | 1.6, 4.2 | Sprint 3 er ferdig |

Kart, liste og stedsside (1.7–1.9) kan bygges mot demodata fra 1.10 før de ekte kildene er
koblet på i 1.3 og 1.5. Epic 2 bygges i sprint 1, fordi forklaringssiden bare trenger
SnowScore-modulen (1.4). Lenkene fra kart, liste og stedsside kommer når de sidene bygges i
sprint 2. Kvalitetspanelet i 2.3 viser demodataenes rapport til 1.5 er ferdig.

**Avvik i sprint 3 (2026-10-23):** Story 3.5 (sol) ble bygget før 3.4 (hurtigvalg), fordi
hurtigvalget «Sol etter snøfall» trenger solfilteret.

**Ikke i v1 (v3):** Story 4.1 (PWA), 4.3 og 4.4 (snøvarsel) og hele Epic 5 (tilbakemelding).
De står i `sprint-status.yaml` med kommentaren «Ikke i v1» og bygges ikke.

Status for hver story står i [fremdriftsplanen](../3-Gjennomføringsfasen/fremdriftsplan.md) og i
`sprint-status.yaml`, ikke her.

## Dette må gruppa sette opp før sprint 2

- [x] GitHub Actions er på (CI kjører på PR-er)
- [ ] Be faglærer slå på GitHub Pages (Settings → Pages → Source: GitHub Actions). Ellers brukes reserven i Story 1.11
- [x] Sally (`bmad-ux`) oppdaterer UX-dokumentene etter forenklingen (PR #21)

## Arbeidsflyt per story

1. Amelia (`bmad-build`) bygger storyen på egen branch, `story/<nummer>-<kort-navn>`.
2. Tester og CI må være grønne.
3. I samme PR settes storyen til `done` i `sprint-status.yaml`, fremdriftsplanen oppdateres, og
   KI-bruken logges i `ai-log/`.
4. Det åpnes en Pull Request. Et annet gruppemedlem tar review, og PR-en merges til `main` når
   sjekkene er grønne og den er godkjent.
