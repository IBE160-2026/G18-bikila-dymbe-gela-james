# 2026-10-07: Forenkling uten Supabase (correct course, runde 2)

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-correct-course` og deretter John (brief og PRD) og Winston (arkitektur), med en kryssgjennomgang av en underagent (Sonnet 5.5)
**Fase:** Planlegging
**Resultat:**
- [`sprint-change-proposal-2026-10-07-forenkling.md`](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-10-07-forenkling.md).
- Produktbriefen er skrevet om.
- PRD v3 og arkitektur v4.
- Supabase, snøvarsel, PWA, tilbakemelding og analyse av treffsikkerhet er tatt ut av v1. Dataprogrammet er et Node-script som publiserer én JSON-fil, og appen er statisk.

## Prompter

### 1
> ut fra dette , er vår prosjekt komplisert [faglærers tilbakemelding limt inn]

**Svar (kort):** Ja, den er vurdert som «Vanskelig». Integrasjonene (Høy) er den største driveren. Kjernen er ikke vanskelig, men driften rundt den er det.

### 2
> Gjør endringer i samsvar med det læreren rådfører oss. Fjern kompliserte deler fra oppleget. For eksempel hvis du mener at arkitektur, tester og de ulike deler vi har bedt deg å gjennomfører fører til mer kompleksitet , så kan du se bort fra enkete deler/dropper dem. Oppdater produktbrifen i samsvar med forenklig rådført av læreren.

**Svar (kort):** Claude anbefalte å fjerne Supabase helt, fordi ~300 steder ikke trenger en database. Joseph valgte «Fjern Supabase + varsel + tilbakemelding» og en ny PR oppå de eksisterende.

**Hva vi gjorde med det:**
- Kryssgjennomgangen fant 8 hull, og alle ble rettet. Flere av dem ble løst ved å fjerne enda mer: historikkfilen `runs.json`, kretsbryteren og analysen (FR-31).
- Claude avviste å slette FR-18/19 og FR-27–29. De er merket «Ikke i v1» med ID-ene bevart, slik at sensor kan se hvordan planen utviklet seg.
