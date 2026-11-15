# UX-forbedring, steg 1: destinasjonskort (Story 1.8b)

## 2026-11-02 kl. 22:30 — Aksel Dymbe

### Oppgave
Aksel bestilte en profesjonell UX/UI-forbedring av SnowFinder: kart, liste, filter, vind, forklaringssiden, mobil og kvalitet. Han ba om en prioritert plan før noe ble bygget.

### Plan
- Plan i sju steg. Aksel valgte steg 1–5 med én PR per steg. Vindvarsel og markørgruppering ble valgt bort, fordi begge krever en kravendring.
- Steg 1 er Story 1.8b. Spec: [`spec-1-8b-destinasjonskort.md`](../../project-workspace/implementation-artifacts/spec-1-8b-destinasjonskort.md)

### Resultat
- **Listen:** viser destinasjonskort med navn og score øverst og Nysnø, Vind og Temp i faste felt nederst. Én kolonne på mobil, og flere kolonner når listen har plass. Skjermleserteksten er uendret.
- **Commits:** `7c9d4ab` (UX) og kode, tester og dokumenter på `story/1-8b-destinasjonskort`, som ikke er pushet.
- **Sjekker:** lint, typecheck, 665 enhetstester, `build:demo` og 131 av 131 E2E er grønne lokalt.
- **Gjennomgang:** av 12 funn ble 10 rettet og 2 avvist.
- **Ny fast regel fra Aksel:** ingen push eller merge til `main` uten hans godkjenning, fordi Vercel publiserer `main`. Lagret i Claudes minne.

### Åpne punkter
- Push og PR for 1.8b venter på Aksels godkjenning. PR #82 (2.1b) bør merges først. Begge legger til linjer i `.memlog.md`, `logg.md` og `sprint-status.yaml`, så flettekonflikter må løses ved å beholde alle linjene.
- Steg 2–5 av UX-forbedringen: filter, forklaringssiden, fargeforklaring på kartet, og en mobil- og kvalitetsrunde.
