# 2026-10-07: Oppdatert AGENTS.md (bmad-project-context, refresh)

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-project-context` (refresh)
**Fase:** Gjennomføring
**Resultat:** `AGENTS.md` er forkortet fra 229 til 89 linjer.
- **Den styrte blokken** er verifisert mot `06b3b89`, og fått nye regler:
  - BMAD alltid;
  - et annet gruppemedlem godkjenner, og agenter merger aldri selv;
  - ingen database, kontoer eller tjenester med nøkler;
  - ingen hemmeligheter;
  - verifiserte kommandoer, og Node 25 støttes ikke;
  - tre observerte fallgruver.
- **Kontekstseksjonen** er forenklet. Git-, CI- og teststrategi er beholdt, og arkitektur- og UX-detaljer peker nå til dokumentene.

## Prompter

### 1
> hva har du endret i kontekst (agent.md) ?

**Svar (kort):** Ingenting ennå. Claude viste forskjellen mellom dagens fil og utkastet.

### 2
> men du skulle se bort fra det som kan virke kompleks i konteksten

**Svar (kort):** Utkastet ble kortet til 74 linjer. Arkitektur-, UX-, Git-, CI- og testdetaljene ble fjernet.

### 3
> hva slags git strategier tenker du på ? / hva tror du vil være i tråd med dette prosjektet men ikke komplisert / har ikke vi slik strategier per dags dato, jeg mener vi har det

**Svar (kort):** Claude anbefalte GitHub Flow i enkleste form og bekreftet at strategiene allerede sto i AGENTS.md §4–§6 (fra #12), i sprintplanen og i briefen.

**Hva vi gjorde med det:**
- Claudes forslag om å fjerne strategiene og lage en ny strategifil ble avvist, fordi det ville fjernet dokumentasjonen kurset krever fra det eneste stedet den står samlet.
- Git-, CI- og teststrategien beholdes i kortform.

### 4
> vi vil helst ha dette punktet Ett annet gruppemedlem godkjenner før merge

**Svar (kort):** Regelen ble skjerpet: godkjenning med Approve i GitHub, og agenter merger aldri selv. Grenbeskyttelse anbefales i meldingen til faglærer.

**Hva vi gjorde med det:** Det er åpent dokumentert at PR #8–#13 ble merget i dag uten godkjenning fra et annet medlem, etter beslutning fra Joseph.

### 5
> kan ikke du bare implementere uten at faglærer slå på tlgangen? / kan vi jobbe med neste steg uten tilgangen ? / kjør på den logiske neste steg

**Svar (kort):** Bryterne krever administratortilgang. Lokale git-hooks kan erstatte CI-sjekkene inntil videre, og bygges i neste steg via `bmad-build`.
