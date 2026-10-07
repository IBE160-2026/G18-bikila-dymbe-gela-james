# 2026-10-07: Lokale git-hooks som erstatter CI (Amelia, oneshot)

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5), agent Amelia (`bmad-build`, oneshot) med én gjennomgangsagent (Blind Hunter)
**Fase:** Gjennomføring
**Resultat:**
- `.githooks/pre-push`:
  - avviser push til `main`;
  - stopper ved ucommittede endringer;
  - kjører lint, typesjekk, test og bygg.
- Hooken slås på med `prepare`-scriptet ved `npm ci`. `.gitattributes` gir LF-linjeskift for hooks, og README har fått en ny del.
- Spec: [`spec-lokale-git-hooks.md`](../../project-workspace/implementation-artifacts/spec-lokale-git-hooks.md).

## Prompter

### 1
> kjør på den logiske neste steg

**Svar (kort):** Amelia bygget hooken uten nye avhengigheter og verifiserte den manuelt i tre scenarier: push til main, vanlig grein og typefeil.

**Hva vi gjorde med det:**
- Gjennomgangen fant at hooken testet filene på disk og ikke det som faktisk pushes. Det ble rettet med en sjekk for ucommittede endringer.
- To forslag ble avvist fordi de ville gjort hooken mer kompleks:
  - hoppe over sletting av greiner;
  - beskytte en eksisterende `hooksPath`.
- To ting ble utsatt: nedgradering av hooken når Actions er på, og `.gitattributes` for hele repoet.
