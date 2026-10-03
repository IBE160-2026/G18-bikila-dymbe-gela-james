# 2026-10-03: Sjekk av agentoppsettet og felles agentinstruksjoner

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), skillen `bmad-project-context`
**Fase:** Gjennomføring
**Resultat:**
- Felles språk (norsk) for agentene i `_bmad/custom/config.toml`
- Nye [`AGENTS.md`](../../AGENTS.md) og [`CLAUDE.md`](../../CLAUDE.md) med regler for agentene
- Oppdaterte README-filer i `project-phase-folders/` som fortsatt viste PRD, UX og epics som «kommer»
- Slettet to utdaterte lokale kopier av repoet på Aksels PC (ingen upushede endringer i dem)

## Prompter

### 1
> hei. pull siste endring inn her i vs code fra git hub slik at jeg får mest mulig oppdatert utgave

**Svar (kort):** Hentet fra GitHub. Ingenting nytt; grenen `story/1-1-skaffolding` var allerede oppdatert.
**Hva vi gjorde med det:** Ingenting å gjøre.

### 2
> hva var de siste endringene jeg har gjort som ikke er pushet til git

**Svar (kort):** Ingen upushede commits, ingen ulagrede endringer og ingen stash.
**Hva vi gjorde med det:** Ingenting å gjøre.

### 3
> kan du se i mine private filer hvor jeg har lagret dette repoet . gi meg fil urlen

**Svar (kort):** Fant repoet og tre eldre kopier på PC-en, ingen med upushede endringer.
**Hva vi gjorde med det:** Gikk videre til prompt 4.

### 4
> slett de to gamle som er utdaterte

**Svar (kort):** Sjekket at kopiene ikke hadde ulagrede endringer, stash eller upushede commits, og slettet dem. BMad-cachen ble beholdt.
**Hva vi gjorde med det:** Godtatt.

### 5
> hvilke fil ligger dette repoet på min private pc

**Svar (kort):** Ga stien til repoet.
**Hva vi gjorde med det:** Brukt som oversikt.

### 6
> status på agentene hva gjør de og oprerer de automatisk i repoet. er de satt opp skikkelig

**Svar (kort):** Agentene er riktig installert, men kjører bare når noen starter dem; ingen GitHub Actions, hooks eller planlagte kjøringer. Fant to mangler: språket var satt til engelsk for dokumenter og norsk bare lokalt hos Aksel, og repoet manglet felles instruksjoner for agentene.
**Hva vi gjorde med det:** Gikk videre til prompt 7.

### 7
> fiks 1 og 2

**Svar (kort):** La norsk som felles språk i `_bmad/custom/config.toml`. Kjørte `bmad-project-context`, som stilte tre spørsmål (hvilken dokumentkopi som gjelder, språk, kjente agentfeil) og foreslo `AGENTS.md` og `CLAUDE.md`. Svar: endre begge kopiene i samme commit; norske dokumenter og engelsk kode; ingen kjente feil.
**Hva vi gjorde med det:** Godkjent. En CI-sjekk for at kopiene er like ble utsatt til `ci.yml` lages i Story 1.1.

### 8
> bruk det du synes er best. pass på at det ikke blir noen overflødige filer. øsnker at fil oppsettet skal være oversiktilig for foreleser slik at han kan gi oss en veldig god karrakter

**Svar (kort):** Fant ingen overflødige filer. Rettet README-filer som viste ferdige dokumenter som «kommer», la en henvisning til `AGENTS.md` i hoved-README, og committet alt på `story/1-1-skaffolding`.
**Hva vi gjorde med det:** Godtatt.
