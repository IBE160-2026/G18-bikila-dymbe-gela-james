# Endringsforslag 2026-11-20: kartet på små telefoner

**Status:** forslag til gruppemøtet. **Ikke godkjent, og ingen kode er endret.**
**Laget av:** Aksel med Claude Code (`bmad-correct-course`, samlet modus).
**Grein:** `docs/kart-sma-telefoner`.

## 1. Problemet

På en liten telefon (375 × 667 px) ser brukeren bare en smal stripe av kartet når Utforsk åpnes. Fra toppen
står dette over kartet:

1. toppmenyen;
2. Kart | Liste og «Oppdatert kl. …»;
3. søkefeltet;
4. «Best akkurat nå», med overskrift og tre rader;
5. fargeforklaringen.

Bunn-arket med «Filter» står fast nederst på skjermen.

**Målt 19.11 på den publiserte siden** (Playwright, 375 × 667): kartet starter på y = 527 px, og bunn-arket dekker
fra omtrent y = 590 px. Bare **rundt 60 px av kartet** er synlig før brukeren ruller. Kartet er 70vh høyt
(`App.css`, `.kart`), så resten ligger under bunn-arket eller utenfor skjermen.

Problemet oppsto da raden «Best akkurat nå» (Story 1.12, 18.11) og fargeforklaringen (18.11) kom over kartet. Den
flyttede forklaringslenken (#116) ga tilbake én linje, men ikke nok.

**Det som taler mot å haste:** i brukertesten (17.–19.11, seks deltakere, SUS 88,75) var det ingen som nevnte
kartet. Det eneste noen fant vanskelig, var tilbakepilen (D6). Oppgavene O1–O5 er ennå ikke ført inn fra
observasjonsskjemaene. De kan vise om noen slet med kartet.

## 2. Hva det påvirker

| Dokument | Hva gjelder kartet |
|---|---|
| PRD FR-33 (Bør ha) og Story 1.12 | «de tre beste stedene **øverst på forsiden**» |
| EXPERIENCE.md, raden «Best akkurat nå» | «mellom søkefeltet og filteret eller kartet, på alle bredder». «Under 768 px tar hvert sted én linje» |
| EXPERIENCE.md, raden «Fargeforklaring» | «en stripe rett over kartet», og «alltid synlig, også under 768 px» |
| DESIGN.md | Målene for raden og `{components.map-legend}` |
| PRD SM-12 og NFR-2 | Ikke berørt. De gjelder lastetid, ikke hvor mye av kartet som synes |

Ingen arkitekturbeslutning berøres. Endringen gjelder bare oppsettet under 768 px. PC er uendret.

## 3. Mulige løsninger

### Løsning 1: kartet før «Best akkurat nå» på mobil

Under 768 px kommer fargeforklaringen og kartet rett etter søkefeltet, og «Best akkurat nå» flyttes under
kartet. Fra 768 px er alt som i dag.

- **Effekt:** kartet starter omtrent der «Best akkurat nå» starter i dag, så rundt **290 px** blir synlig over
  bunn-arket i stedet for 60. Dette er anslått og ikke målt.
- **Ulempe:** «Best akkurat nå» er ikke lenger det første brukeren ser på mobil. Brukeren må rulle for å se den.
  Det svekker formålet med FR-33 («øverst på forsiden», «uten å bytte visning») på små skjermer.
- **Berørte filer:**
  - `src/pages/Utforsk.tsx` (rekkefølgen i `.utforsk-resultat`) eller `src/App.css` (`order` under 768 px);
  - `tests/e2e/best-naa.spec.ts`, `tests/e2e/forklaring.spec.ts` (lenken i raden på 375 px) og
    `tests/e2e/kart.spec.ts` (tegnforklaringen);
  - EXPERIENCE.md og Story 1.12, begge kopiene.

### Løsning 2: «Best akkurat nå» sammenfoldet på mobil

Under 768 px viser raden bare det beste stedet på én linje, for eksempel «Best akkurat nå: Store Trolltinden
67 · Godt», med en knapp «Vis tre» som folder ut de to neste (`<details>` eller en knapp med `aria-expanded`).
Fra 768 px er alt som i dag.

- **Effekt:** to linjer på rundt 48 px hver forsvinner, så rundt **160 px** av kartet blir synlig. Også dette er
  anslått. Det beste stedet står fortsatt øverst.
- **Ulempe:** én ekstra interaksjon for å se nummer to og tre. Komponenten må få ny tilstand, og den må testes for
  tastatur og skjermleser.
- **Berørte filer:**
  - `src/components/BestAkkuratNaa.tsx` og `BestAkkuratNaa.test.tsx`;
  - `src/App.css` (`.best-naa*` under 768 px);
  - `tests/e2e/best-naa.spec.ts` og `forklaring.spec.ts`;
  - EXPERIENCE.md, DESIGN.md og Story 1.12, begge kopiene.

### Alternativ: dokumentere det som avvik

Ingen kodeendring. I sluttrapporten (§3 og «videre arbeid») står det:
- at kartet på en 375 × 667-skjerm bare viser rundt 60 px før brukeren ruller;
- at det er et bevisst valg å la «Best akkurat nå» og fargeforklaringen stå øverst;
- at brukertesten ikke viste problemer med det;
- at løsning 1 eller 2 er en mulig forbedring.

- **Effekt:** ingen risiko før kodefrysen, og ingen ny review.
- **Ulempe:** førsteinntrykket av kartet på små telefoner er fortsatt svakt. Sensor kan legge merke til det i
  demoen hvis den vises på en telefon.

## 4. Risiko før kodefrysen 28.11

| | Løsning 1 | Løsning 2 | Avvik |
|---|---|---|---|
| Innsats | Liten: rekkefølge og CSS, og 2–3 E2E-tester | Middels: ny tilstand, tilgjengelighet og 3–4 tester | Ingen kode, et avsnitt i sluttrapporten |
| Risiko | Lav til middels. E2E på Ubuntu har tidligere feilet på oppsett som passet lokalt (bredere fonter). Raden må bli i `.utforsk-resultat`, så bunn-arket står fast (`sok.spec.ts`) | Middels. Ny interaksjon rett før frysen, og den må gjennom review | Ingen |
| Krav som endres | FR-33/Story 1.12 «øverst», og EXPERIENCE «på alle bredder» | EXPERIENCE «hvert sted én linje», og DESIGN | Ingen |
| Rekker vi det? | Ja, med `bmad-build`, review fra Joseph og merge innen 26.11 | Trolig, men lite slakk | Ja |

Begge løsningene krever `bmad-build` med review. PR #124 (ytelse) bør merges først, siden den også berører
Utforsk-testene.

## 5. Anbefaling og beslutning

**Anbefaling:**
- **Avvik nå**, siden brukertesten ikke viste noe problem, og frysen er om åtte dager.
- **Løsning 1** hvis gruppa vil rette det. Den gir mest kart for minst kode.
- Før gruppa bestemmer seg, bør O1–O5 fra observasjonsskjemaene føres inn. Viser de at noen slet med kartet på
  mobil, taler det for løsning 1.

**Gruppa avgjør på gruppemøtet.** Godkjenner gruppa løsning 1 eller 2:
1. Rett PRD/Story 1.12, EXPERIENCE.md og eventuelt DESIGN.md i begge kopiene.
2. Bygg med `bmad-build` på en `fix/`-grein, med review fra Joseph.

Velger gruppa avvik, skrives avsnittet inn i sluttrapporten.

| Beslutning | Dato | Av |
|---|---|---|
| Løsning 1, foreslått av Aksel 20.11, venter på bekreftelse på gruppemøtet 23.11. Avvik er reserven hvis løsningen ikke er merget innen 26.11 | 2026-11-20 | Aksel |
| *(gruppas bekreftelse fylles ut på møtet 23.11)* | | |
