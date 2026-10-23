---
title: 'Story 3.2b: stedssidens adresse bærer søket videre (UJ-1: filter + sted)'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: 'ff2842f010723cccdb72bbc7625a1c0e93a4b54e'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/spec-3-2-del-og-gjenapne-filtrert-sok.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** UJ-1 steg 6 sier at brukeren deler en lenke der «URL har filter + sted». Etter Story 3.2 har bare Utforsk filteret i adressen. Stedssiden er `/sted/<id>` uten søket, så en delt stedslenke, eller «Tilbake» på en stedsside som er åpnet direkte, gir kartet uten filter (utsatt i gjennomgangen av 3.2).

**Approach:** Stedssidens adresse bærer søket den ble åpnet fra, med samme parametre og regler som Utforsk: `/sted/gaustatoppen?visning=liste&nysno=2&temp=0`. Stedssiden viser det samme som før. «Tilbake» går til Utforsk med det søket. Aksel valgte dette 2026-10-23 («Filter + sted i adressen»).

## Boundaries & Constraints

**Always:**
- Spørringen på stedssiden lages og leses med de samme funksjonene som på Utforsk (`parseFilter`/`serializeFilter` i `shared/filter.ts` og spørringsbyggeren i `router.ts`), i samme faste rekkefølge, og standardverdier skrives ikke. Ingen ny tolkning.
- En stedslenke fra kartet eller listen tar med gjeldende søk. En stedslenke uten søk er fortsatt `/sted/<id>`, så gamle lenker virker.
- «Tilbake» på stedssiden: åpnet i appen går den tilbake i historikken som i dag; åpnet direkte går den til Utforsk med søket fra adressen (uten søk: kartet uten filter, som i dag).
- En ugyldig verdi i stedsadressen gir standard, som på Utforsk. Stedssiden krasjer aldri, og «Fant ikke stedet» og meldingen for for gamle data virker som før.

**Never:** Ingen endring i hva stedssiden viser. Ingen ny avhengighet. «Avstand» havner aldri i adressen. Toppnavigasjonens lenker («SnowFinder», «Slik beregner vi SnowScore») tar ikke med søket.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fra listen | `/?visning=liste&nysno=2&temp=0`, trykk Gaustatoppen | Adressen blir `/sted/gaustatoppen?visning=liste&nysno=2&temp=0` | N/A |
| Fra kartet | `/?nysno=2`, klikk en markør | `/sted/<id>?nysno=2` | N/A |
| Delt stedslenke | Åpne `/sted/gaustatoppen?visning=liste&nysno=2&temp=0` i ny økt, trykk «Tilbake» | Listen med nysnø «minst 2 cm», temperatur «høyst 0 °C» og seks steder | N/A |
| Uten søk | `/sted/gaustatoppen`, trykk «Tilbake» | Kartet uten filter, som i dag | N/A |
| Ugyldig verdi | `/sted/gaustatoppen?nysno=abc&temp=0`, trykk «Tilbake» | `/?temp=0` | Ingen krasj |
| Ukjent sted | `/sted/finnes-ikke?nysno=2` | «Fant ikke stedet», som før | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/router.ts` -- `Route` `sted` får søket (for eksempel `sok: UtforskRoute`, eller visning, filter og sortering). `parseRoute` leser spørringen også for `/sted/<id>`. `href` for `sted` legger til samme spørring som Utforsk (gjenbruk `utforskQuery`). `utforsk()` gir standardsøket.
- `src/components/KartVisning.tsx:76` og `src/components/ListeVisning.tsx:107` -- stedslenkene får gjeldende søk. `Utforsk` sender det inn (ruten den allerede har).
- `src/pages/Sted.tsx:71` -- «Tilbake» går til Utforsk med søket fra ruten. `App.tsx` sender ruten eller søket inn.
- `src/components/Toppnavigasjon.tsx` -- menyens nøkkel bruker `href(route)`; uendret er greit.
- `src/lib/router.test.ts` -- parse, href og rundtur for sted med og uten søk, og ugyldig verdi.
- `tests/e2e/filter.spec.ts` (eller `sted.spec.ts`) -- E2E for matrisen. `tests/e2e/kart.spec.ts` og `sted.spec.ts` sjekker i dag adresser som `/sted/<id>`; de skal fortsatt passe når søket er tomt.
- `README.md` -- én setning om at stedslenken også bærer søket.
- `project-workspace/implementation-artifacts/deferred-work.md` -- oppføringen om UJ-1 fra 3.2 merkes `resolved`.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/router.ts` og `router.test.ts` -- søket i `sted`-ruten, med parse, href og tester.
- [x] `KartVisning.tsx`, `ListeVisning.tsx`, `Utforsk.tsx` -- stedslenker med gjeldende søk.
- [x] `Sted.tsx`, `App.tsx` -- «Tilbake» til Utforsk med søket.
- [x] E2E for hver rad i matrisen.
- [x] `README.md` og `deferred-work.md`.

**Acceptance Criteria:**
- Given rettingen, when lint, typecheck, test, build og `npm run test:e2e` kjøres, then er alle grønne, og `gh pr checks` er grønn før merge.

## Implementation Notes

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run test:e2e` -- expected: alle grønne

## Review Triage Log

Tre lag: Blind Hunter (9 funn), Edge Case Hunter (2 funn, samme sak) og Verification Gap (ingen hull, 1 annet funn, samme sak).

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | Alle tre | Stedssidens adresse ryddes ikke når siden lastes, i motsetning til Utforsk og AD-12, så ugyldige verdier deles videre | medium | patch | Samme omskriving som på Utforsk. E2E sjekker at `/sted/gaustatoppen?nysno=abc&temp=0` blir `?temp=0`. |
| 2 | Blind | E2E-testen for en ugyldig verdi sjekker ikke stedssidens egen adresse | low | patch | Dekkes av rettingen over. |
| 3 | Blind | «Gå til kartet» på «Fant ikke stedet» og meldingen om for gamle data mister søket | medium | patch | Lenken bruker søket fra stedsadressen. Det er nettopp tilfellet der et delt sted har falt ut. |
| 4 | Blind | Toppnavigasjonen på stedssiden mister søket | false | avvist | Bevisst valg i spec-en: «SnowFinder» er en hjem-knapp uten filter. «Tilbake» er veien til søket. |
| 5 | Blind | Sporingsfilene er ikke oppdatert | false | avvist | Gjøres ved leveringen. 3.2b fullfører Story 3.2 og har ingen egen nøkkel i `sprint-status.yaml`. |
| 6 | Blind | 3.2b står ikke i epics og har ikke gått gjennom `bmad-correct-course` | low | avvist | Ingen krav endres: rettingen får appen til å oppfylle UJ-1 og FR-21 slik de står. Aksel valgte den 2026-10-23. |
| 7 | Blind | Spec-en er ikke med i diffen | false | avvist | Den er holdt utenfor diffen med vilje (bare edge-laget leser den). |
| 8 | Blind | Alias og kopiert filterkonstant i `App.test.tsx` | low | patch | Ett navn og én delt konstant. |
| 9 | Blind | Ingen test av at en kartmarkør får det nye søket etter en filterendring, og kommentaren i `KartVisning` er utdatert | low | patch | Ny E2E og oppdatert kommentar. |

Sjekker lokalt etter gjennomgangen: lint, typecheck, test (425), build og `npm run test:e2e` (54) er grønne.
