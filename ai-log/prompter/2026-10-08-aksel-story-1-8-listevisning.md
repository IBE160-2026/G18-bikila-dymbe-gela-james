# 2026-10-08: Story 1.8, tilgjengelig listevisning

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` (Amelia). Underagenter implementerte og gjorde gjennomgangen (Blind Hunter, Edge Case Hunter og Verification Gap).
**Fase:** Gjennomføring
**Resultat:** [`spec-1-8-listevisning.md`](../../project-workspace/implementation-artifacts/spec-1-8-listevisning.md), `src/components/ListeVisning.tsx`, `src/components/VisningVeksler.tsx`, `src/lib/sortering.ts`, `src/lib/router.ts` og `tests/e2e/liste.spec.ts`.

## Prompter

### 1
> gjør endringene og gå videre

**Svar (kort):** Claude rettet først planene om bakgrunnskartet (egen Correct Course-logg) og startet så Story 1.8. Planene avgjorde de åpne punktene: veksleren er en toggle under navigasjonen, og avstand bruker nettleserens posisjon bare når brukeren velger det. Det var derfor ingen spørsmål.

**Hva vi gjorde med det:**
- Listen bruker samme `useSteder()`-hook som kartet. Hver rad er én lenke med navn, score som tall og etikett, og nysnø, vind og temperatur.
- Gjennomgangen ga 21 funn. 11 er rettet:
  - skjermlesere får nå skilletegn mellom delene i raden;
  - axe stopper også på «serious», så kontrasten sjekkes;
  - lenken «Tilbake» på stedssiden går tilbake til listen;
  - et sent posisjonssvar overstyrer ikke lenger brukerens valg, og posisjonsforespørselen har fått en timeout;
  - E2E sjekker nå også veien fra liste til kart.
- Sorteringen i URL-en er utsatt til Epic 3, sammen med filtrene.
