# 2026-10-07: Endringsrunde etter faglærers tilbakemelding (correct course)

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5), skillen `bmad-correct-course` (batch-modus)
**Fase:** Gjennomføring
**Resultat:**
- [`sprint-change-proposal-2026-10-07.md`](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-10-07.md),
  godkjent av Joseph. Hovedpunkter:
  - ny Må ha FR-30 (lokal demomodus med fixture-data);
  - pipelinens robusthet flyttet til Bør ha;
  - ny NFR-DQ (datakontrakt, kvalitet per kjøring, sporbarhet);
  - fasittabeller for skivindu og filter;
  - suksesskriteriene delt i tre;
  - AD-10;
  - wireframes og brukertestplan;
  - Story 1.10 og 2.5.

## Prompter

### 1
> her er også tilbakemelding fra faglærer (oppdragsgiver) du skal ta utgangpunkt i når du jobber med prosjester. Bruk alltid bmad agenter når du skal utfører et oppdrag og skriv dette i agent.md. Du skal også ta utgangspunkt at denne løsningen skal være på en dataingiør nivå på alle områder for eksempel, data analytikk, ux design med brukevennlighet som hovedpunkt. Gjerne alle atributter som kan føre til at denne oppgaven er en topp karakter oppgave sett ut fra en data ingeniør eller analytikker ståsted. Her er for øvrig tilbakemelding fra sensor for at oppgaven skal være en topp oppgaver. Gi tilbakemelding om du har forstått oppgaven før du begynne å utfører nå
>
> [faglærerens tilbakemelding på product brief, 2026-10-06, limt inn i sin helhet; samme innhold som `project-phase-folders/1-Oppstartsfasen/tilbakemelding-product-brief.md`]

**Svar (kort):** Claude oppsummerte oppdraget og pekte på en spenning. Faglæreren ber om å
forenkle, mens oppdraget ber om ingeniørnivå. Claude foreslo å vise nivået som kvalitet og dybde
(datakontrakt, datakvalitet, fasit, analyse, brukertest), ikke som mer infrastruktur, og foreslo
rekkefølgen correct-course → PRD/arkitektur/UX → AGENTS.md → Story 1.1.

**Hva vi gjorde med det:** Gikk videre til prompt 2.

### 2
> vi er enig om kvalitet , kjør foreslåtte endring

**Svar (kort):** `bmad-correct-course` ble kjørt i batch-modus. Sjekklisten ble gått gjennom, og
endringsforslaget ble skrevet.

**Hva vi gjorde med det:**
- Tre andre veier ble vurdert og avvist:
  - Å legge til kontoer og sosiale funksjoner for å treffe kursets skjermliste. Det ble i stedet
    en mapping med begrunnelse.
  - Supabase CLI som eneste lokale kjøremåte. Den krever Docker, så demomodus med statiske data
    ble valgt som standard for sensor.
  - Tilbakerulling. Det fantes ingen ferdig kode å rulle tilbake.
- Noen avsnitt ble først skrevet på engelsk og rettet til norsk.

### 3
> (svar på godkjenningsspørsmål) Ja, godkjent
