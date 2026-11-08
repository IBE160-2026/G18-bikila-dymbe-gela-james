# 2026-11-08: Steg 4 og 5 i UX-forbedringen, fargeforklaring på kartet

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5) i VS Code, `bmad-ux` (Sally, oppdatering)
**Fase:** Gjennomføring
**Resultat:** Fargeforklaringen på kartet (SRS-F-15) er ført inn i DESIGN.md (`map-legend` og avsnittet «Fargeforklaring») og EXPERIENCE.md (ny rad, tilgjengelighetsgulvet og mobil). Steg 5 blir en egen story etter merge.

## Prompter

### 1
> Jeg vil ta steg 4 og 5 i UX-forbedringen (dokumentert i PR #93, greinen docs/ux-poengfordeling).
>
> 1. Les steg 4 og 5 i UX-dokumentet og gi meg en kort oppsummering av hva hvert steg går ut på.
> 2. Foreslå om de bør være én eller to stories, og hvilken grein de bør bygge på (docs/ux-poengfordeling eller story/2-5-delpoengstolper hvis de berører Delpoengliste).
> 3. Still meg spørsmålene som trengs for å låse valgene, før du skriver spec. Bruk samme flyt som for Story 2.5: spec → mine valg → godkjenning → bygg.
>
> Ikke push noe uten at jeg har godkjent.

**Svar (kort):** Claude fant at steg 4 og 5 ikke står i UX-dokumentene i #93, bare i fremdriftsplanen og sesjonsloggen. Claude brukte derfor bestillingen fra 2. november, SRS-F-15 og koden. Steg 4 er fargeforklaring på kartet. Steg 5 er mobil og kvalitet. Claude foreslo to stories: steg 4 på en ny docs-grein fra `docs/ux-poengfordeling`, og steg 5 etter at #89–#94 er merget.

**Aksels valg (spørsmål):**
- Plassering: «I et hjørne av kartet»
- Mobil: «Alltid synlig, kompakt»
- Innhold: «Intervall og ord»
- Steg 5: «Gjennomgang nå, bygg etter merge»

### 2 (`bmad-ux`)
Claude startet `bmad-ux` med valgene over. Sally fant at bunn-arket på mobil dekker bunnen av kartet, og spurte på nytt.

**Aksels valg (spørsmål):**
- Hjørne: «Oppe til høyre på alle bredder»
- Kompakt: «Samme liste, mindre»
- Skjermleser: «Ja, som liste med overskrift»

**Hva vi gjorde med det:** Valgene er ført i memloggen og skrevet inn i DESIGN.md og EXPERIENCE.md, i begge kopiene. Ingenting er pushet.
