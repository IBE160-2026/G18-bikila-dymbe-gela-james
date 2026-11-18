# Gjennomgang av nettsiden og utsatt kodefrys

## 2026-11-18 kl. 19:23 — Aksel Dymbe

### Oppgave
Aksel ba om fire ting:
- status for prosjektet;
- et sammendrag av Bårds tilbakemelding på PRD-en;
- en gjennomgang med agentene av hva som må til for at den publiserte siden (snowfinder-seven.vercel.app) ser profesjonell ut og blir brukt daglig;
- at kodefrysen utsettes én uke, med leveringen 2. desember og sluttrapporten etterpå.

### Plan
- **Status:** hentet fra `fremdriftsplan.md`, `sprint-status.yaml`, `brukertest/resultater.md` og `issues.md`.
- **PRD-tilbakemelding:** `tilbakemelding-prd.md` (2026-11-12) ble lest og sammenlignet med endringsforslaget fra 2026-11-14 (PR #99 og #100).
- **Gjennomgang:** skjermbilder av den publiserte siden med Playwright, på PC (1440 px) og iPhone 13. Deretter `bmad-party-mode` med Sally, John, Mary, Winston og Amelia.
- **Datoene:** endret i milepæler, fremdriftsplan og aktivitetsdiagram på greinen `docs/utsatt-kodefrys`, med logg i `ai-log`.

### Resultat
- **Funn fra gjennomgangen:**
  - Forsiden svarer ikke på «hvor er det best i dag?».
  - Kartet mangler tegnforklaring, og «Lite»-prikkene dominerer.
  - Hvor ferske dataene er, vises bare på stedssiden.
  - Navn brytes midt i ordet («Innerdalstårn/et»).
  - Søkefeltet har ingen plassholder.
  - Tallene har for mange desimaler, og nysnø vises i både cm og mm.
  - «0 · Lite» står ved siden av et skivindu på fredag, uten forklaring.
  - «Tilbake» er bare en lenke nederst på stedssiden.
- **Prioritering:** rettingene tas før kodefrysen. «Best akkurat nå» (topp 3) må gjennom `bmad-correct-course`. Favoritter, «nær meg», minikart og PWA er v2.
- **PR #110 merget** (`890614f`, flettecommit `41d5720`). Alle sjekkene var grønne.
  - M5 kodefrys er 2026-11-28.
  - Generalprøven er 2026-12-01.
  - M6 levering er 2026-12-02.
  - F5 sluttrapport kommer etter leveringen, uten dato.
  - Datoene står som «forslag fra Aksel».
- **Partyminne:** `project-workspace/party-mode/memories/installed/.memlog.md`.

### Åpne punkter
- Gruppa bekrefter de nye datoene, og Bård må godta at leveringen flyttes til 2. desember.
- Endringsforslag for «Best akkurat nå» (`bmad-correct-course`) før storyen bygges.
- Rettings-PR med listen fra gjennomgangen (`bmad-build`), med review fra et gruppemedlem, innen 28. november.
- Bårds to refleksjonsspørsmål i PRD-tilbakemeldingen besvares i sluttrapporten.
- Sett en dato for sluttrapporten (F5).

## 2026-11-18 kl. 20:10 — Aksel Dymbe

### Oppgave
Gruppa bekreftet de nye datoene. Aksel ba om steg 2, endringsforslaget for «Best akkurat nå», godkjente forslaget og ba om at endringene ble gjort og PR-en åpnet.

### Plan
- Datoene endret fra «forslag» til «vedtatt», på greinen `docs/best-akkurat-naa`. Greinen het før `docs/sesjonslogg-2026-11-18`.
- `bmad-correct-course` i samlet modus, etter malen i endringsforslaget om søk fra 2026-11-04.
- Endringsforslag: [sprint-change-proposal-2026-11-18-best-akkurat-naa.md](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-11-18-best-akkurat-naa.md).

### Resultat
- **Datoene er vedtatt:** `9bfe824`, i milepælene, fremdriftsplanen og aktivitetsdiagrammet.
- **Nytt krav FR-33 (Bør ha):**
  - PRD-en (begge kopiene): §0, §4.3, §6.2 og §12.
  - SRS-en: ny SRS-F-35 og F3.5, og dokumentet er versjon 2.4.
  - EXPERIENCE.md (begge kopiene): ny komponentrad og en setning om mobil.
- **Story 1.12:** står i epics og i kravinventaret.
- **Status og plan:** `sprint-status.yaml` har fått `1-12: backlog`, og `epic-1` står som `in-progress`. `sprintplan.md` har fått et avsnitt om avviket, og fremdriftsplanen er oppdatert.
- **Logg:** raden i `ai-log` og promptene er ført.

### Åpne punkter
- Bård må godta at leveringen flyttes til 2. desember.
- Rettings-PR fra gjennomgangen (se punktet over), deretter Story 1.12 med `bmad-build` på `story/1-12-best-akkurat-naa`, begge før 28. november.
