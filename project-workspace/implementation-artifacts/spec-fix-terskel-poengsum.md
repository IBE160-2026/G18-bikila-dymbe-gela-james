---
title: 'Rett terskelen: en kjøring der stedene mangler poengsum, skal ikke erstatte gode data'
type: 'bugfix'
created: '2026-10-22'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Revisjonen 9. oktober fant at 95 %-terskelen i `scripts/pipeline/publish.ts` bare teller avviste eller manglende MET-svar. Steder med «ufullstendige data» teller som gyldige. Svarer MET gyldig, men prognosen ikke dekker vinduet (for eksempel en utdatert prognose), blir alle stedene ufullstendige. Kjøringen publiseres likevel og erstatter et kart med gode poengsummer med et kart uten en eneste poengsum.

**Approach:**
- **Beslutning (Aksel, 2026-10-22):** En kjøring publiseres bare når minst 95 % av stedene i katalogen har poengsum (`snowScore.kind === 'score'`). Ufullstendige steder teller ikke lenger som gyldige mot terskelen. Ellers står forrige datafil urørt, og rapporten sier hvorfor.
- Rapportfeltet `andelGyldige` beholder betydningen sin (andel steder med gyldig MET-svar), så datakvalitetspanelet og `demo.json` ikke endres. Demo består fortsatt: 23 av 24 steder har poengsum (95,8 %).
- PRD (FR-5), arkitekturen (AD-2), epics (Story 1.5) og datakatalogen oppdateres, i begge kopiene der de finnes. Den gamle regelen merkes som endret, ikke slettet.
- **Ferdig når:** de fire sjekkene og E2E er grønne, og `gh pr checks` er grønn.

</frozen-after-approval>

## Implementation Notes

- **Endring:** `scripts/pipeline/publish.ts` har fått `scoredShare` (steder med `snowScore.kind === 'score'` delt på katalogen), og terskelen bruker den. Konstanten heter nå `MIN_SCORED_SHARE`. `validShare` gir fortsatt `andelGyldige` i rapporten. Årsaken i rapporten er «Bare X % av stedene har poengsum; minst 95 % kreves».
- **Tester:** `publish.test.ts` dekker ett ufullstendig av 24 (publiseres), nøyaktig 95 % med ett ufullstendig av 20 (publiseres), to ufullstendige av 24 (publiseres ikke), alle ufullstendige (publiseres ikke, forrige fil urørt) og ett avvist pluss ett ufullstendig av 24 (publiseres ikke). `run.test.ts` har en live-kjøring der MET svarer gyldig med prognoser som er et døgn gamle: ingenting publiseres. Den gamle testen «counts incomplete places as valid» er erstattet.
- **Demo:** `demo.json` er uendret. Testen som regenererer demodataene sjekker allerede at kjøringen publiseres og er byte-lik den committede fila, så den vokter marginen (23 av 24).
- **Dokumenter:** produktbrief, PRD (FR-5, ordlisten, FR-30) og arkitektur (AD-2) i begge kopiene, Story 1.5 i epics, `data-dictionary.md`, README og den hurtigbufrede `epic-1-context.md`. Den gamle regelen er merket endret, ikke slettet.
- **Ikke `bmad-correct-course`:** Endringsforslaget 2026-10-09 (Oppfølging) sendte disse funnene til `bmad-build`, og Aksel tok valget i økten.
- **Sjekker lokalt:** lint, typecheck, test (371), build.

## Review Triage Log

Blind Hunter (oneshot), 13 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Produktbriefen (begge kopier) sier fortsatt «gyldige data fra MET» | medium | patch | Linje 141 og 191 sier nå også «og fikk en poengsum». |
| 2 | PRD-ordlisten («Publisert batch») og FR-5-setningen bruker gammel betydning | medium | patch | Begge peker nå på poengsum. |
| 3 | README sier «gyldige data»; AGENTS.md sier «95 % gyldige» | medium | patch (README) | README er rettet. AGENTS.md sier bare «gyldige», som PRD nå definerer som poengsum, og endres bare via `bmad-project-context`. |
| 4 | Kravendringen gikk utenom `bmad-correct-course` | low | avvist | Endringsforslaget 2026-10-09 sendte funnet til `bmad-build`, og Aksel valgte regelen. Notert over. |
| 5 | KI-loggen mangler | false | avvist | Skrives ved leveringen (rad i `logg.md` og promptfil). |
| 6 | Spec-en er uferdig | false | avvist | Skrives ved leveringen. |
| 7 | Ingen test der avviste og ufullstendige til sammen faller under terskelen | low | patch | Ny test: ett av hver i 24 publiseres ikke. |
| 8 | Ingen grensetest for ufullstendige ved nøyaktig 95 % | low | patch | Ny test: 19 med poengsum og ett ufullstendig av 20 publiseres. |
| 9 | `scoredShare` har ingen egen enhetstest; `validShare` er fortsatt eksportert | low | avvist | Alle grenser testes gjennom `publish`, som er den eneste brukeren. `validShare` brukes av `buildReport`. |
| 10 | Rapporten har ikke tallet beslutningen bygde på | low | avvist | Prosenten står i `ikkePublisertFordi`, og en upublisert rapport vises bare i jobbloggen, aldri i datakvalitetspanelet. |
| 11 | Eldre specs viser til regelen og testen som er endret | false | avvist | Ferdige specs er historikk og skal vise hva som gjaldt da. |
| 12 | Ingenting vokter at demo fortsatt møter terskelen | false | avvist | `run.test.ts` sjekker at demokjøringen publiseres og er byte-lik `demo.json`. |
| 13 | Rettingen står ikke i fremdriftsplanen | low | avvist | Fremdriftsplanen oppdateres etter den siste av de tre rettingene. |
