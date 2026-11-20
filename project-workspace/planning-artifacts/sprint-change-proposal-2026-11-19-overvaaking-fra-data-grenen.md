# Endringsforslag 2026-11-19: overvåkingsagenten leser fra GitHub, ikke fra nettsiden

**Utløser:** Prøvekjøringene av overvåkingsagenten 19.11.
**Bygger på:** [endringsforslaget fra 2026-11-18](sprint-change-proposal-2026-11-18-overvaakingsagent.md) (NFR-6, SRS-N-11, AD-11).
**Modus:** samlet. **Grein:** `docs/overvaaking-fra-data-grenen`.

## 1. Problemet

Aksel satte opp den planlagte Claude-økten 19.11 (rutinen `SnowFinder-overvåking`, kl. 06, 12, 18 og 24). Fem
prøvekjøringer kl. 22.46–23.18 kom ikke fram til `https://snowfinder-seven.vercel.app`:

- `curl` fikk `CONNECT tunnel failed, response 403` fra nettverkssperren i skymiljøet, og WebFetch fikk
  `ENOTFOUND`.
- Det skjedde i begge skymiljøene på kontoen, også etter at Aksel satte nettverkstilgangen til «Full».
  Miljøet kan ikke velges eller endres fra rutinesiden.
- GitHub-tilgangen virket i alle kjøringene: agenten leste issues og kjøringene av `data.yml` og `data-timer.yml`.

Agenten oppførte seg riktig hver gang. Den stilte ingen diagnose, laget ingen issue og varslet Aksel. Rutinen er
slått av til dette forslaget er godkjent.

## 2. Hva det påvirker

**Det samme som før:** Agenten kan fortsatt lese `latest.json` uten å gå via Vercel. `vercel.json` sender
`/data/latest.json` videre til `raw.githubusercontent.com/…/data/latest.json`. Fila agenten leser fra grenen
`data` gjennom GitHub, er derfor den samme fila som nettsiden viser.

**Det agenten mister:** at siden faktisk svarer. Som erstatning leser agenten statusen Vercel setter på siste
commit på `main` (`Vercel: Deployment has completed`). Det fanger en publisering som feiler, men ikke at
siden er nede eller at omskrivingen i `vercel.json` slutter å virke etter en vellykket publisering. Dette er en
kjent begrensning.

| Dokument | Endring |
|---|---|
| PRD NFR-6 (begge kopiene) | «sjekker nettsiden utenfra» blir «sjekker datafila og publiseringen gjennom GitHub». Begrensningen står der |
| PRD §12 endringslogg (begge kopiene) | Ny rad 2026-11-19 |
| SRS-N-11 og versjonsmerknad (`SnowFinder-PRD-og-SRS.html`) | Samme endring, versjon 2.6 |
| Arkitektur AD-11 og tabellen over eksterne aktører (begge kopiene) | «checks the site» blir «reads `latest.json` on the `data` branch and the Vercel status on `main`». Begrensningen står der |
| Epics, kravlista NFR-6 | Samme endring |
| `drift/overvaakingsagent.md` | Sjekk 1 og 2 og tabellen over diagnoser skrives om (§4.5) |
| README «Drift og overvåking» | Én setning endres |
| Prompten i rutinen | Nettadressen tas ut. Agenten bes ikke lenger hente nettsiden |

Kode, stories, UX og tester berøres ikke.

## 3. Valgt vei

**Direkte justering.** Aksel valgte dette 19.11 framfor å prøve mer med miljøinnstillingene og framfor å la agenten
sende varsel om sperren fire ganger i døgnet.

- **Innsats:** liten. Bare dokumenter, og rutinen oppdateres.
- **Risiko:** lav. Det som faktisk har gått galt i prosjektet (droppet kjøring 4.11, gamle data), fanges fortsatt.
  Nedetid hos Vercel fanges ikke, men da ser gruppa det selv på siden.
- **Tidsplan:** ingen endring. Agenten skal fortsatt være i drift før kodefrysen 28.11.

## 4. Endringene

### 4.1 PRD NFR-6 (`SnowFinder-PRD.md` og `prd.md`)

GAMMELT:
> I tillegg sjekker en planlagt agent nettsiden utenfra fire ganger i døgnet, uavhengig av GitHub Actions. Den
> lager ett issue med etiketten `overvåking` når siden ikke svarer, når datafila har under 95 % av stedene, eller
> når dataene er over 2 timer gamle, og lukker det når alt er i orden igjen.

NYTT:
> I tillegg sjekker en planlagt agent fire ganger i døgnet, uavhengig av GitHub Actions, datafila som siden viser
> (`latest.json` på grenen `data`) og statusen til siste publisering hos Vercel. Den lager ett issue med
> etiketten `overvåking` når publiseringen har feilet, når datafila har under 95 % av stedene, eller når dataene
> er over 2 timer gamle, og lukker det når alt er i orden igjen. Agenten når ikke selve nettsiden fra skymiljøet,
> så den ser ikke om siden er nede etter en vellykket publisering.

### 4.2 PRD §12, ny rad

> ### 2026-11-19: overvåkingsagenten leser fra GitHub
>
> - Agenten kom ikke fram til nettsiden fra skymiljøet. Den leser nå datafila på grenen `data` og statusen til
>   publiseringen hos Vercel gjennom GitHub, og ser ikke om siden er nede
>   ([sprint-change-proposal-2026-11-19-overvaaking-fra-data-grenen.md](…)).

### 4.3 SRS-N-11

GAMMELT: «… skal en planlagt agent sjekke nettsiden utenfra fire ganger i døgnet, uavhengig av GitHub Actions,
og lage ett issue med etiketten `overvåking` når siden ikke svarer, …»

NYTT: «… skal en planlagt agent fire ganger i døgnet, uavhengig av GitHub Actions, sjekke datafila på grenen
`data` og statusen til siste publisering hos Vercel, og lage ett issue med etiketten `overvåking` når
publiseringen har feilet, …». Resten er uendret. Ny versjonsmerknad: **Versjon 2.6** (2026-11-19).

### 4.4 Arkitektur AD-11, «Silence is watched from outside» og tabellen over eksterne aktører

NYTT (*v9, 2026-11-19*):
> A scheduled Claude session outside GitHub Actions checks four times a day, through GitHub: `latest.json` on
> the `data` branch (the file `vercel.json` serves as `/data/latest.json`) is `live` with at least 95 % of the
> locations and a `referenceTime` under 2 h old, and the `Vercel` commit status on `main` is `success`. The cloud
> session cannot reach the site itself (egress blocked, 2026-11-19), so an outage after a successful deploy is
> not detected.

Tabellen: «reads the site, `/data/latest.json` and the runs …» blir «reads `latest.json` on the `data` branch,
the `Vercel` status on `main` and the runs …».

### 4.5 `drift/overvaakingsagent.md`

- **Sjekk 1, Publiseringen:** les commit-statusen på siste commit på `main`. Statusen `Vercel` skal være
  `success`. Er den `pending`, regnes den som i orden.
- **Sjekk 2, Datafila:** les `latest.json` på grenen `data` gjennom GitHub. Kravene er de samme: `mode` er
  `live`, minst 285 steder, `report.publisert` er `true` og alderen er under 2 timer.
- **Sjekk 3:** uendret.
- **Diagnosene:**
  - «Siden svarer ikke» blir «Publiseringen har feilet».
  - «Datafila mangler eller er ugyldig» sjekker grenen `data`.
  - «Kjøringene er grønne, men siden er gammel» utgår, fordi agenten leser den samme fila som siden.
- **Nytt avsnitt «Det du ikke ser»:** agenten ser ikke om selve siden er nede, og prøver aldri å hente den.

### 4.6 README og rutinen

- **README:** «sjekker … nettsiden utenfra» blir «sjekker datafila og publiseringen gjennom GitHub».
- **Rutinen:** den nye prompten nevner ikke nettadressen og peker fortsatt på instruksen. Den settes først inn etter merge,
  og så slås rutinen på igjen.

## 5. Overlevering

- **Omfang:** lite. Alle dokumentene endres i én `docs/`-PR, uten story og uten kode.
- **Etter merge:**
  1. Oppdater og slå på rutinen.
  2. Kjør prøvene fra forslaget 2026-11-18, §5:
     - én kjøring uten avvik, som ikke skal lage noe issue;
     - én kjøring med grensen satt til 1 minutt, som skal lage ett issue;
     - én kjøring til med samme grense, som ikke skal kommentere;
     - én kjøring med grensen tilbake på 2 timer, som skal lukke issuet.
  3. Legg lenken til issuet i `fremdriftsplan.md`.
  4. Legg linjen om agenten inn i AGENTS.md via `bmad-project-context`.
- **Ferdig når:** prøvene over har gitt riktig resultat, og den første faste kjøringen har gått uten feil.

## 6. Godkjenning

Godkjent av Aksel 2026-11-19 («ja godkjent og lag pr»).
