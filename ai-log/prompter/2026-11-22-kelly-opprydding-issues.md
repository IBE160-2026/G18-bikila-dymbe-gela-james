# 2026-11-22 – Kelly – opprydding i åpne punkter i issues.md

Verktøy: Claude Code (Opus 5.5), uten BMad-agent.

## Prompter (ordrett)

1. jeg ønsker bare at kellygela1 skal være logget inn
2. hvor er vi nå
3. vil du gå igjennom issues.md og merke det som er løst/udatert

## Resultat

- GitHub CLI: kontoen `kellygela` logget ut, og den lagrede git-innloggingen i nøkkelringen slettet. Git bruker nå `Kellygela1` gjennom `gh`.
- Status lest fra `fremdriftsplan.md`, åpne PR-er og sakslisten for 23.11.
- Åpne punkter i `.logs/*/issues.md` sjekket mot PR-er, `sprint-status.yaml`, `deferred-work.md`, PRD-en og greinene på GitHub (sak 4c på møtet 23.11).
  - Aksel: 48 → 37 åpne. 11 lukket som løst eller utgått, 4 fikk en merknad om delvis løst.
  - Joseph: 19 → 12 åpne. 7 lukket, 2 fikk merknad.
  - missbikila: 7 → 1 åpent. 6 lukket.
- Ingen linjer slettet. Punkter som ikke kunne bekreftes fra repoet eller GitHub, står åpne.
