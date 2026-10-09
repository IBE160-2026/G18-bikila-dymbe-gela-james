# Sprint Change Proposal: Pålogging droppes fra kursets skjermkrav

**Dato:** 2026-10-09
**Utløst av:** Aksels beslutning «vi dropper pålogging» (2026-10-09)
**Modus:** batch
**Omfang:** Minor. Bare dokumenter endres.
**Godkjent:** Aksel. Han valgte «Bare pålogging» da spørsmålet om de andre skjermkravene ble stilt.

## 1. Problem

Emnet ber om wireframes for fem skjermer: pålogging, profil, innsjekking, sosial feed og arrangementer (PRD, åpent spørsmål 6). SnowFinder har ingen kontoer i v1, så pålogging har ingen skjerm å kobles til. Aksel har besluttet at pålogging droppes. De fire andre skjermkravene kobles fortsatt til nærmeste SnowFinder-skjerm av Sally (`bmad-ux`) i steg 8c.

## 2. Konsekvenser

| Område | Konsekvens |
|---|---|
| Epics og stories | Ingen. Ingen story bygger pålogging eller kontoer. |
| PRD | Åpent spørsmål 6 får beslutningen. |
| UX (EXPERIENCE.md) | Åpent punkt 3 (U2) gjelder nå bare fire skjermer. |
| Arkitektur | Ingen. v1 har ingen kontoer. |
| Fremdriftsplan | Steg 8c omfatter skjermkravene uten pålogging. |
| AGENTS.md | Linjen om kursets skjermkrav i §5 oppdateres, så den ikke motsier beslutningen. |
| Kode | Ingen. |

## 3. Anbefalt løsning

Direkte justering: beslutningen skrives inn der skjermkravene er nevnt.

**Åpen risiko:** Faglærer har ikke bekreftet at pålogging kan droppes. Hvis wireframes for alle fem skjermene er en del av vurderingen, kan det koste poeng. Gruppa bør be faglærer bekrefte det, og ellers begrunne valget i EXPERIENCE.md (ingen kontoer, etter faglærers råd om lite omfang).

## 4. Endringer

PRD og EXPERIENCE.md endres i begge kopiene.

- **PRD, åpent spørsmål 6:** Nytt avsnitt: «*(v4, 2026-10-09)* Gruppa har besluttet at pålogging droppes: SnowFinder har ingen kontoer, så det finnes ingen påloggingsskjerm å vise. Profil, innsjekking, sosial feed og arrangementer kobles fortsatt til nærmeste SnowFinder-skjerm i EXPERIENCE.md (steg 8c). Faglærer har ikke bekreftet beslutningen ennå.»
- **EXPERIENCE.md, åpent punkt 3:** Nytt avsnitt: «*(v4, 2026-10-09)* Pålogging er droppet, fordi SnowFinder ikke har kontoer. U2 gjelder nå profil, innsjekking, sosial feed og arrangementer. Faglærer har ikke bekreftet.»
- **Fremdriftsplan, steg 8c:** «Wireframes, kursets skjermkrav og brukertestplan» blir «Wireframes, kursets skjermkrav (uten pålogging, droppet 2026-10-09) og brukertestplan». «Hvor er vi nå?» får en linje om beslutningen.
- **AGENTS.md §5:** «Kursets skjermkrav (pålogging, profil, innsjekking, feed, arrangementer) kobles …» blir «Kursets skjermkrav (profil, innsjekking, feed, arrangementer; pålogging er droppet 2026-10-09) kobles …».

## 5. Overlevering

- **Omfang:** Minor. Claude legger inn endringene på grenen `docs/dropp-palogging`, som leveres som PR og merges når `gh pr checks` er grønn.
- **Neste steg:** Sally (`bmad-ux`) kobler de fire gjenværende skjermkravene til SnowFinder i steg 8c. Gruppa ber faglærer bekrefte at pålogging kan droppes.
