# Endringsforslag 2026-11-18: «Slik beregner vi SnowScore» flyttes på mobil

**Status:** godkjent av Aksel 2026-11-18
**Modus:** samlet
**Omfang:** lite (direkte justering av ett akseptkriterium, ingen ny story). Se §7: lenken flyttes, den fjernes ikke.

## 1. Problemet

På en iPhone viser første skjerm av Utforsk dette, ovenfra og ned:
- toppnavigasjonen;
- Kart | Liste med «Oppdatert kl. …»;
- lenken «Slik beregner vi SnowScore» på egen linje;
- søkefeltet;
- «Best akkurat nå» (Story 1.12);
- tegnforklaringen.

Bunn-arket dekker resten, så kartet er nesten ikke synlig. Aksel så det på den publiserte siden 2026-11-18, etter at PR #113 og #114 var merget. Han ba om at lenken bare skal stå i menyen på mobil.

- **Type:** endring i et UX-krav fra gruppa. Det er ingen feil i koden.
- **Hvorfor det går an:** forklaringen kan fortsatt nås med ett trykk på ☰ og fra hver score-visning på stedssiden, så F2.2 og FR-8 er oppfylt. Lenken ved Kart | Liste kom inn i Story 2.1b (2026-11-02), før søkefeltet, «Best akkurat nå» og tegnforklaringen tok plassen over kartet.

## 2. Hva endringen berører

| Område | Endring |
|---|---|
| PRD og SRS | Ingen. FR-8 og F2.2 krever at forklaringen kan nås fra hver poengsum, ikke en lenke ved vekslingen. |
| Epics | Akseptkriteriet i Story 2.1b om lenken på Utforsk endres, se 4.1. |
| EXPERIENCE.md (begge kopiene) | Raden «Kart \| Liste-veksling» endres, se 4.2. |
| Arkitektur, DESIGN.md | Ingen endring. |
| Kode og tester | Lenken og CSS-regelen `.utforsk-forklaring` fjernes fra `Utforsk.tsx` og `App.css`. App.test og to E2E-tester i `forklaring.spec.ts` endres, så de sjekker at Utforsk ikke har noen egen lenke og at lenken ligger bak ☰ på mobil. |
| sprint-status | Ingen ny story. Endringen er en `fix` før kodefrysen 28. november. |

## 3. Anbefalt løsning: direkte justering

- **Innsats:** liten. Én lenke og én CSS-regel fjernes, og tre tester endres.
- **Risiko:** lav. Fra 768 px var lenken allerede skjult, så PC-oppsettet er uendret.
- **Vurdert og forkastet:**
  - Gjøre overskriften «Best akkurat nå» mindre. Det sparer mindre plass, og lenken ville fortsatt stått på egen linje.
  - Flytte lenken inn på samme linje som Kart | Liste. «Oppdatert kl. …» fyller allerede linjen på 375 px.

## 4. Endringene i detalj

### 4.1 Story 2.1b (`SnowFinder-Epics-og-Stories.md`)

**GAMMELT:**

> **And** på Utforsk vises lenken «Slik beregner vi SnowScore» én gang: i toppnavigasjonen fra 768 px, og
> ved Kart/Liste under 768 px, der toppnavigasjonen ligger bak ☰

**NYTT:**

> **And** på Utforsk vises lenken «Slik beregner vi SnowScore» én gang, i toppnavigasjonen: synlig fra 768 px,
> og bak ☰ under 768 px *(endret 2026-11-18: lenken ved Kart/Liste på mobil er fjernet, så kartet får plass,
> sprint-change-proposal-2026-11-18-forklaring-bare-i-meny.md)*

### 4.2 EXPERIENCE.md, raden «Kart | Liste-veksling»

**GAMMELT:**

> Lenken «Slik beregner vi SnowScore» står på samme linje, men bare under 768 px, der toppnavigasjonens lenke ligger bak ☰. Fra 768 px vises bare toppnavigasjonens lenke, så den aldri står to ganger *(endret 2026-11-02)*.

**NYTT:**

> Lenken «Slik beregner vi SnowScore» står bare i toppnavigasjonen, og under 768 px ligger den bak ☰. Fra 2026-11-02 sto den også her på mobil, men den ble fjernet 2026-11-18, så kartet får plass under søkefeltet, «Best akkurat nå» og tegnforklaringen. Forklaringen kan fortsatt nås fra hver score-visning på stedssiden.

## 5. Overlevering

- **Omfang:** lite. Amelia (`bmad-build`) retter det på `fix/forklaring-bare-i-meny`, i samme PR som dette forslaget.
- **Ferdig når:**
  - Utforsk ikke har noen egen lenke til forklaringen på noen bredde;
  - lenken er nåbar via ☰ på 375 px;
  - lint, typecheck, test, `build:demo` og E2E er grønne.

## 6. Godkjenning

Godkjent av Aksel 2026-11-18 («ja godkjent gjør endringene og lag pr»).

## 7. Endret etter gjennomgangen (2026-11-18)

Gjennomgangen av koden (Blind Hunter) fant at §2 tok feil. FR-8 (Må ha) krever at forklaringen er
tilgjengelig «fra hver SnowScore-visning i løsningen (lenket, ikke bare fra toppmenyen)», og SRS-F-10
sier det samme. Hvis lenken ble fjernet, kunne kartet, listen og «Best akkurat nå» på mobil bare nå
forklaringen via ☰, og det bryter kravet.

Aksel valgte derfor 2026-11-18 å **flytte** lenken i stedet for å fjerne den:
- Under 768 px står den til høyre på samme linje som overskriften «Best akkurat nå».
- Den tar ingen egen linje, så kartet får plass, og FR-8 er oppfylt.
- Fra 768 px er den skjult som før, fordi toppnavigasjonen viser lenken.
- Ved null treff vises verken raden eller noen poengsum på Utforsk, så kravet gjelder ikke der.

Valget «Fjern lenken og svekk FR-8» ble forkastet, fordi et Må ha-krav ikke skal svekkes rett før kodefrysen.

Teksten i 4.1 og 4.2 er erstattet av dette:

- **Story 2.1b:** «på Utforsk vises lenken «Slik beregner vi SnowScore» én gang: i toppnavigasjonen fra 768 px,
  og på linjen med overskriften «Best akkurat nå» under 768 px, der toppnavigasjonen ligger bak ☰».
- **EXPERIENCE.md:** raden «Kart | Liste-veksling» sier at lenken er flyttet. Raden «Best akkurat nå» beskriver lenken.
- **Kontekst:** `epic-2-context.md` og `epic-3-context.md` er rettet på samme måte.

