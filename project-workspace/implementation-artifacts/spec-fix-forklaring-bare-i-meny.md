---
title: '«Slik beregner vi SnowScore» flyttes til raden «Best akkurat nå» på mobil'
type: 'bugfix'
created: '2026-11-18'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/planning-artifacts/sprint-change-proposal-2026-11-18-forklaring-bare-i-meny.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** På mobil fyller lenken «Slik beregner vi SnowScore» ved Kart | Liste en egen linje, og kartet er nesten ikke synlig over bunn-arket. FR-8 (Må ha) krever likevel at score-visningene er lenket til forklaringen, ikke bare fra toppmenyen.

**Approach (endret av Aksel 2026-11-18 etter gjennomgangen, endringsforslaget §7):**
- Flytt lenken fra Kart | Liste til høyre på overskriftslinjen i «Best akkurat nå». Den vises bare under 768 px og skjules fra 768 px, der toppnavigasjonen viser den.
- Testene endres:
  - App.test: lenken er i raden og ikke i verktøylinjen;
  - E2E på 375 px for kart og liste: én lenke, på overskriftens linje, minst 44 px høy, og den åpner forklaringen;
  - E2E fra 768 px: ingen lenke i `main`.

</frozen-after-approval>

## Implementation Notes

- **Første versjon fjernet lenken** fra Utforsk helt. Gjennomgangen (Blind Hunter) viste at det bryter FR-8 (Må ha): forklaringen skal være lenket fra hver SnowScore-visning, «ikke bare fra toppmenyen». Aksel valgte å flytte lenken i stedet, og intensjonen over er endret etter det.
- **Filer:**
  - `BestAkkuratNaa.tsx`: `.best-naa-topp` med `h2` og lenken;
  - `Utforsk.tsx`: lenken er fjernet fra `.utforsk-verktoy`, og importen av `Lenke` er fjernet;
  - `App.css`: `.best-naa-topp` og `.best-naa .best-naa-forklaring` er skjult fra 768 px. Regelen har to klasser, fordi `.forklaring-lenke` kommer senere i fila og ellers ville vunnet. E2E-testene på 1280 px fant det. To utdaterte kommentarer er rettet.
- **Dokumenter:** endringsforslaget §7, Story 2.1b, EXPERIENCE.md (begge kopiene), `epic-2-context.md` og `epic-3-context.md`.

## Review Triage Log

Blind Hunter (2026-11-18), 10 funn:

| # | Funn | Verdikt | Bevis og rute |
|---|---|---|---|
| 1 | Endringsforslaget sier at FR-8 ikke berøres, men PRD-en sier «ikke bare fra toppmenyen» | high | Bekreftet i PRD FR-8 og SRS-F-10. Rute: intent_gap. Aksel valgte å flytte lenken, og koden og endringsforslaget §7 er laget på nytt |
| 2 | Setningen i EXPERIENCE.md om at forklaringen nås «fra hver score-visning på stedssiden» er misvisende | medium | Patch: raden er skrevet om etter flyttingen |
| 3 | `epic-2-context.md` og `epic-3-context.md` beskriver den gamle lenken | low | Patch: rettet. `.memlog.md` for UX er en logg fra BMad-økter og endres ikke for hånd |
| 4 | To kommentarer i App.css er utdaterte | low | Patch: rettet |
| 5 | Høydesjekken i forklaring.spec er indirekte og skjør | medium | Patch: fjernet. Testen sjekker nå at lenken ikke er i `.utforsk-verktoy`, og at den står på overskriftens linje |
| 6 | Kommentaren i PC-testen er utdatert | low | Patch: nevner nå lenken som bare vises på mobil |
| 7 | Den nye testen på 375 px overlapper ☰-testen | false | Etter flyttingen tester den lenken i raden, ikke ☰ |
| 8 | Regex-sjekken i App.test er for bred | low | Patch: sjekker `not.toContain('utforsk-forklaring')` og at lenken står i raden |
| 9 | Spesifikasjon, ai-log og fremdriftsplan er ikke fullført | false | Fullført før commit |
| 10 | NYTT-teksten i endringsforslaget stemmer ikke med lenken | low | Patch: §7 erstatter 4.1 og 4.2 med teksten som faktisk står i dokumentene |
