# Endringsforslag 2026-11-19 (2): overvåkingsagenten varsler med push når den ikke får skrive issues

**Utløser:** prøve 2 av overvåkingsagenten 19.11 kl. 23.43.
**Bygger på:** [2026-11-18](sprint-change-proposal-2026-11-18-overvaakingsagent.md) og
[2026-11-19](sprint-change-proposal-2026-11-19-overvaaking-fra-data-grenen.md).
**Modus:** samlet. **Grein:** `docs/overvaaking-push-varsel`.

## 1. Problemet

I prøve 2 var grensen satt til 1 minutt. Agenten fant avviket og stilte riktig diagnose, men GitHub avviste issuet
med `403 Resource not accessible by integration`. Claude-appen har bare lesetilgang i organisasjonen
`IBE160-2026`, og gruppa kan ikke gi den mer, fordi bare eieren av organisasjonen kan det. Aksel vil ikke be om det
og ba om en løsning som virker uten.

Push-varsel til eieren av rutinen (Aksel) virket i alle sju kjøringene 19.11.

## 2. Løsningen

- **Agenten prøver fortsatt å lage issuet først.** Går det, er alt som før.
- **Svarer GitHub med 403**, sender agenten i stedet ett push-varsel til Aksel med det issuet ville inneholdt: tittel,
  diagnose, neste steg og de viktigste tallene. Aksel lager issuet med etiketten `overvåking` og gir beskjed til
  gruppa.
- **Agenten unngår å varsle om det samme to ganger** ved å lese åpne issues, og det kan den fortsatt.
  - Finnes det et åpent issue med samme diagnose, gjør den ingenting.
  - Er det ingen åpne issues, varsler den på nytt ved hver kjøring til Aksel har laget issuet, altså høyst fire ganger
    i døgnet. Det fungerer som en påminnelse.
- **Når alt er i orden igjen** og et åpent issue finnes, prøver agenten å kommentere og lukke det. Går ikke det, sender
  den ett push-varsel: «I orden igjen. Lukk #N». Varselet kommer igjen ved hver kjøring til issuet er lukket.

**Ulempen:** varselet går bare til Aksel, ikke direkte til gruppa, og issuet blir laget for hånd. Det skrives
inn som kjent begrensning ved siden av den fra endringen tidligere samme dag.

## 3. Hva det påvirker

| Dokument | Endring |
|---|---|
| PRD NFR-6 (begge kopiene) | «lager ett issue» blir «lager ett issue, eller sender et push-varsel til eieren av rutinen når den ikke får skrive issues» |
| PRD §12 | Ny rad |
| SRS-N-11 | Samme endring, versjon 2.7 |
| Arkitektur AD-11 (begge kopiene) | Én setning om push-varsel som reserve |
| `drift/overvaakingsagent.md` §3 og §4 | Regler for push-varselet |
| README | Én setning |

Ingen kode, story, UX eller test berøres.

## 4. Overlevering og ferdig når

Alt gjøres i én `docs/`-PR. Etter merge kjøres prøvene med grensen satt til 1 minutt:

1. Ingen åpne issues. Agenten skal sende ett push-varsel med diagnosen.
2. Aksel, eller Claude med Aksels `gh`, lager issuet `[PRØVE] …` med etiketten `overvåking`. En ny kjøring skal ikke
   sende noe varsel.
3. Med grensen tilbake på 2 timer skal agenten sende «I orden igjen. Lukk #N». Deretter lukkes issuet for hånd.

Lenken til prøve-issuet føres inn i `fremdriftsplan.md`.

## 5. Godkjenning

Godkjent av Aksel 2026-11-19 («ja godkjent .lag pr og kjør prøvene»).
