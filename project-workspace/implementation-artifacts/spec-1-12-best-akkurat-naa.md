---
title: 'Story 1.12: Se de beste stedene akkurat nå'
type: 'feature'
created: '2026-11-18'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-1-context.md'
  - '{project-root}/project-workspace/planning-artifacts/sprint-change-proposal-2026-11-18-best-akkurat-naa.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Forsiden svarer ikke på «hvor er det best i dag?». Svaret finnes bare om man bytter til listen, som er sortert etter score (FR-33, endringsforslaget 2026-11-18, godkjent av Aksel).

**Approach:** En rad med overskriften «Best akkurat nå» mellom søkefeltet og filteret eller kartet, på alle bredder. Den viser høyst tre av treffene, sortert som listen sortert etter score (`sorterSteder(…, 'score')`, lik score avgjøres av navnet). Steder med ufullstendige data er ikke med. Hvert sted er én lenke med navn og score-badge til stedssiden, og filteret og visningen står i adressen (Story 3.2b). Overskriften er «Best blant treffene» når et filterkrav er aktivt (`aktiveKrav(filter)`). Raden vises ikke ved null treff, og heller ikke når ingen av treffene har poengsum. Den er en `section` med en `h2` og en `ol`. Under 768 px tar hvert sted én linje uten sideveis rulling, og raden ligger aldri i bunn-arket. Utvalget er en ren funksjon med enhetstester for rekkefølge, lik score, ufullstendige data og færre enn tre treff. E2E-testen i demomodus åpner det første stedet fra raden og kjører axe på Utforsk mens raden er synlig. Akseptkriteriene står i Story 1.12 i `SnowFinder-Epics-og-Stories.md`.

</frozen-after-approval>

## Implementation Notes

- **Filer:**
  - `src/lib/sortering.ts`: `besteSteder(treff, antall = 3)` gjenbruker `sorterSteder(…, 'score')` og tar bort steder med ufullstendige data;
  - `src/components/BestAkkuratNaa.tsx`: `section`/`h2`/`ol`, der hvert sted er én `Lenke` med navn, en skjult kommaskille og `ScoreBadge`;
  - `src/pages/Utforsk.tsx` og CSS i `src/App.css`.
- **Plassering:** raden står først i `.utforsk-resultat`, ikke rett over `.utforsk`. Bunn-arket er `sticky` inne i `.utforsk`. Da raden sto over beholderen, startet `.utforsk` under skjermkanten på en kort telefon (560 px), og Filter-knappen forsvant. E2E-testen i `sok.spec.ts:215` oppdaget det. Raden står fortsatt mellom søkefeltet og kartet eller listen på alle bredder. På PC står den i resultatkolonnen ved siden av filterpanelet.
- **Mobil:** under 768 px har radene mindre luft og mindre badge, så hver rad er 48 px høy, over kravet på 44 px for berøring. Et navn som er for langt, slutter med «…», så det blir én linje uten sideveis rulling. EXPERIENCE.md (begge kopiene) sier ikke lenger at kartet alltid starter på første skjerm, for på en liten telefon kan det starte under bunn-arket.
- **Aktivt filter:** `aktiveKrav(filter).length > 0`, den samme regelen som chipene i filteret bruker.
- **Tester:**
  - 5 enhetstester for `besteSteder`: rekkefølge, lik score etter navn, ufullstendige data, færre enn tre treff og at listen den får, ikke endres;
  - 3 komponenttester;
  - `tests/e2e/best-naa.spec.ts` med 6 tester: uten filter på kart og liste, med filter, null treff, lenke med søket og «Tilbake», 375 px og axe.

## Review Triage Log

Oneshot-gjennomgang 2026-11-18 med Blind Hunter (subagent). Etter rettingene var lint, typecheck, 792 enhetstester, `build:demo` og E2E grønne. Plasseringen ble sjekket på skjermbilder på 1440 og 390 px.

| # | Funn | Verdikt | Bevis og rute |
|---|---|---|---|
| 1 | `epic-1-context.md` sier at 1.12 står som `backlog` | low | Status er `in-progress`. Patch: linjen er rettet |
| 2 | Kontekstfilen og endringsforslaget lover at kartet starter på første skjerm | low / false | Patch: kontekstfilen er rettet. Endringsforslaget er godkjent historikk og endres ikke |
| 3 | Story-greinen inneholder commitene fra fix-PR-en (#113) | false | Det er bevisst. Greinen er bygget oppå #113, så de ikke kommer i konflikt i `Utforsk.tsx` og `App.css`. Når #113 er merget, flettes `main` inn |
| 4 | Den kompakte CSS-en på mobil gjør ikke radene lavere, og kommentaren sier 44 px | low | Delvis riktig. Radene gikk ned fra rundt 62 til 48 px (`min-height` er `--spacing-7` = 48 px), men tallet 44 var feil. Patch: kommentaren og notatet sier nå 48 px |
| 5 | At id avgjør lik score, er ikke testet | low | Patch: ny test med tre like navn og like poengsummer, i begge rekkefølger |
| 6 | Parameteren `antall` brukes ikke | low | Patch: fjernet, erstattet med konstanten `BESTE_ANTALL` |
| 7 | Ingen test på appnivå for treff uten poengsum, eller for at ufullstendige steder holdes utenfor | medium | Akseptkriteriet var bare dekket av en ren funksjon og komponenttest. Patch: App.test sjekker begge |
| 8 | Komponenttestene sjekker ikke rekkefølgen, badgen og skilletegnet | low | Patch: testen sjekker navnet, «, » og poengsummen for alle tre, i rekkefølge |
| 9 | Testen på 375 px sjekker bare kartvisningen, og PC-plasseringen er ikke testet | medium | Patch: sjekk i listevisningen og en ny test på 1280 px (tre kort på linje over kartet, ved siden av panelet) |
| 10 | `parseFloat(lineHeight)` kan gi `NaN` | low | Avvist: `line-height` er satt i tokens og blir alltid regnet om til piksler. Det går ikke an å nå tilstanden i appen |
| 11 | Navn som kuttes, kan ikke leses i sin helhet | low | Patch: `title` på navnet. Skjermleseren får fortsatt hele navnet |
| 12 | Hover-stil uten tilsvarende fokusstil | low | Patch: `:focus-visible` får samme kant |
| 13 | Spesifikasjonen mangler Review Triage Log og sjekker | false | Denne seksjonen ble skrevet da spesifikasjonen ble ferdigstilt |
| 14 | Rad i ai-log mangler | false | Føres i samme commit som storyen |
| 15 | `fremdriftsplan.md` er ikke oppdatert | false | Oppdateres i samme commit (Hvor er vi nå?, steg 9, Sist oppdatert) |
