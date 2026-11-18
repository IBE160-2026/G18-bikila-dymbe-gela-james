# Endringsforslag 2026-11-18: «Best akkurat nå» på forsiden

**Status:** godkjent av Aksel 2026-11-18
**Modus:** samlet
**Omfang:** lite (direkte justering, én ny story)

## 1. Problemet

Forsiden svarer ikke på spørsmålet de fleste har når de åpner SnowFinder: «Hvor er det best i dag?»

- **Det brukeren ser i dag:** brukeren møter først knappene Kart og Liste, et tomt søkefelt og et kart med rundt 300 prikker. Prikkene har ingen tegnforklaring, og de fleste er grå. Svaret finnes, men bare om brukeren bytter til listen. Listen er sortert etter score, så Snota (53), Rásttigáisá (52) og Blåhøa (49) står øverst.
- **Kilden:** en gjennomgang av den publiserte siden (snowfinder-seven.vercel.app) 2026-11-18, med skjermbilder på PC og iPhone. Gjennomgangen ble gjort i `bmad-party-mode` med Sally, John, Mary, Winston og Amelia. Aksel ba om en side som «mange personer ønsker å benytte seg av daglig». Rommet var enig i at et direkte svar øverst er den enkeltendringen som gjør mest for daglig bruk innen fristen.
- **Type:** et nytt krav fra gruppa. Ingen eksisterende krav er feil.
- **Avvik fra en regel:** gruppa vedtok at det ikke skulle komme nye stories etter 16. november. Gruppa vedtok også 2026-11-18 at kodefrysen flyttes til 28. november og leveringen til 2. desember ([milepæler](../../project-phase-folders/2-Planleggingsfasen/milepæler.md#vedtaket-fra-2026-11-18)). Med den ekstra uka er det plass til denne ene storyen. Godkjennes forslaget, er det et vedtatt unntak fra regelen. Det åpner ikke for andre nye stories.

## 2. Hva endringen berører

| Område | Endring |
|---|---|
| PRD | Ny **FR-33: Beste steder akkurat nå** *(Bør ha)* i §4.3. Beskrivelsen i §4.3 nevner FR-33, §6.2 lister den, og §12 får en ny oppføring. |
| Epics | Ny **Story 1.12: Se de beste stedene akkurat nå** i Epic 1, som eier Utforsk (`Utforsk.tsx`). FR-33 føres i kravinventaret og dekningskartet. |
| Andre stories | Ingen endres. Liste, kart, søk og filter er uendret. |
| Arkitektur | Ingen endring. Utvalget er de samme `treff` som kart og liste viser (AD-8), sortert med den eksisterende `sorterSteder(…, 'score')`. Det trengs ingen ny datakontrakt, ny avhengighet eller ny fil i `shared/`. |
| UX | Ny komponent **Best akkurat nå** i komponentmønstrene i `SnowFinder-EXPERIENCE.md` (begge kopiene), og en setning i «Responsivt design». |
| DESIGN.md | Ingen nye tokens. Raden bruker de eksisterende tokenene for kort, score-badge og lenker. |
| SnowFinder-PRD-og-SRS.html | Ny **SRS-F-35** (F3.5) og en linje i endringsloggen. Dokumentet blir versjon 2.4. SRS-F-33 er allerede brukt (tom tilstand). |
| Brukertestplanen | Ingen endring. Testen 17.–19. november kjøres på versjonen før denne storyen. Oppgave 1 bruker filteret og påvirkes ikke. |
| sprint-status.yaml | Ny linje `1-12-se-de-beste-stedene-akkurat-naa: backlog`, og `epic-1` går fra `done` til `in-progress`. |
| sprintplan.md | Story 1.12 legges etter rettingene, med avviket forklart. |
| Avhengigheter, nøkler og tjenester | Ingen nye. |

**Ikke med (v2, i sluttrapporten som videre arbeid):** favoritter i nettleseren, «nær meg», minikart og prognose time for time på stedssiden, og PWA. Rettingene fra den samme gjennomgangen er heller ikke med. Det gjelder blant annet tegnforklaringen, ordbrudd i navn, søkefelt uten plassholder og hvor ferske dataene er. Rettingene er ikke nye krav: tegnforklaringen er allerede krevd i FR-12, EXPERIENCE.md og SRS-F-15. De bygges derfor som `fix`-PR-er uten endringsforslag.

## 3. Anbefalt løsning: direkte justering

Én ny story i Epic 1. Ingen rollback og ingen endring i MVP-målene, bare ett nytt Bør ha-krav.

- **Innsats:** lav. Én komponent som sorterer de stedene Utforsk allerede har, enhetstester og en E2E-test i demomodus med axe.
- **Risiko:** lav. Raden leser data og endrer ikke filteret, adressen eller datafila. Den største risikoen er at kartet havner lenger ned på mobil. Det løses ved at raden er kompakt: én linje per sted og ingen ekstra tekst.
- **Tid:** én story, ferdig før kodefrysen 28. november.

### Valg i storyen

| Spørsmål | Anbefalt | Forkastet |
|---|---|---|
| Hvilke steder? | Topp 3 av **treffene**, altså de samme stedene som kart og liste viser med det aktive filteret. Overskriften er «Best akkurat nå» uten filter og «Best blant treffene» med filter. | Topp 3 av alle steder uansett filter: raden ville da motsi filteret brukeren nettopp har valgt. |
| Hvilke steder er med? | Bare steder med poengsum. Ufullstendige data er ikke med. Steder med for gamle data er allerede fjernet (NFR-3). | Å la steder med ufullstendige data være med. Det kan ikke skje i praksis, fordi de sorteres sist. |
| Rekkefølge ved lik score | Samme som listen sortert etter score: navn, så id. | En egen regel, som ville gitt to rekkefølger å teste. |
| Når skjules raden? | Ved null treff, der kortet for null treff allerede står, og når ingen treff har poengsum. Har bare 1 eller 2 steder poengsum, vises de. | Å vise en tom rad med forklaring. Det ville gitt to meldinger om det samme. |
| Lav score | Raden vises også når alle tre har «Lite». Badgen sier det ærlig. | Å skjule raden eller pynte på teksten. Det strider mot tesen om tillit. |
| Plassering | Mellom søkefeltet og filteret eller kartet, på alle bredder, og aldri i bunn-arket. | Bare i listevisningen. Da får de som bruker kartet ikke svaret. |

Andre løsninger som ble vurdert:

- **Listen som standardvisning:** gir svaret, men gjør kartet til en sekundær visning og endrer FR-12, UJ-1 og alle E2E-testene. Forkastet.
- **Favoritter («Mine steder») i stedet:** gir mest daglig bruk, men er en større funksjon med lagring i nettleseren og flere tilstander. Den passer ikke før 28. november. Den flyttes til v2.

## 4. Endringene i detalj

### 4.1 PRD (`SnowFinder-PRD.md` og kopien `prd.md`)

**§4.3, beskrivelsen. GAMMELT:**

> […] I tillegg et søkefelt for den som vet hvilket sted hen vil se. Realiserer UJ-1 (kart), UJ-3 (liste) og UJ-4 (søk).

**NYTT:**

> […] I tillegg et søkefelt for den som vet hvilket sted hen vil se, og en rad med de beste stedene akkurat nå for den som bare vil ha svaret. Realiserer UJ-1 (kart), UJ-3 (liste) og UJ-4 (søk).

**§4.3, nytt krav etter FR-32:**

> #### FR-33: Beste steder akkurat nå *(Bør ha)*
>
> Utforsk viser de tre stedene med høyest SnowScore blant treffene øverst, over kartet og listen, så brukeren får svaret uten å lete.
>
> **Konsekvenser (testbare):**
> - Raden viser høyst 3 steder blant de samme treffene som kart og liste viser, sortert som listen sortert etter SnowScore (lik score: navn). Steder med ufullstendige data er ikke med.
> - Hvert sted viser navnet og SnowScore som tall og poengnivå (FR-13), og åpner stedssiden med mus, berøring eller Enter.
> - Overskriften er «Best akkurat nå» uten aktivt filter og «Best blant treffene» med aktivt filter.
> - Raden vises ikke ved null treff, og ikke når ingen av treffene har poengsum.
> - Raden står over kartet og listen på alle bredder, og aldri i bunn-arket.
>
> *Begrunnelse:* gjennomgangen av den publiserte siden 2026-11-18 viste at forsiden ikke svarte på «hvor er det best i dag?» (sprint-change-proposal-2026-11-18-best-akkurat-naa.md).

**§6.2, første punkt. GAMMELT:**

> - Beste skivindu (FR-17), kalkulator på forklaringssiden (FR-10), hurtigvalg (FR-15), solfilter (FR-22), avstandsfilter (FR-23), stedstypefilter (FR-24), nysnø siste 24 t (FR-25)

**NYTT:**

> - Beste skivindu (FR-17), kalkulator på forklaringssiden (FR-10), hurtigvalg (FR-15), solfilter (FR-22), avstandsfilter (FR-23), stedstypefilter (FR-24), nysnø siste 24 t (FR-25), beste steder akkurat nå (FR-33)

**§0, setningen om rekkefølgen. GAMMELT:**

> […] FR-32 (søk) står i §4.3 sammen med kart og liste.

**NYTT:**

> […] FR-32 (søk) og FR-33 (beste steder akkurat nå) står i §4.3 sammen med kart og liste.

**§12, ny oppføring etter «2026-11-14»:**

> ### 2026-11-18: beste steder akkurat nå
>
> - Ny FR-33 (Bør ha) i §4.3 og §6.2. Den er et vedtatt unntak fra regelen om ingen nye stories etter 16. november, etter at kodefrysen ble flyttet til 28. november (sprint-change-proposal-2026-11-18-best-akkurat-naa.md).

Frontmatter: `updated: 2026-11-18`. Status forblir `final`.

### 4.2 Epics (`SnowFinder-Epics-og-Stories.md`)

- **Kravinventar:** ny linje `FR-33: Beste steder akkurat nå (topp 3 av treffene over kart og liste) — Bør ha (2026-11-18)`.
- **FR-dekningskart:** `FR-1 til FR-7, FR-12, FR-13, FR-16, FR-30, FR-33: Epic 1`.
- **Epic 1, «FRs dekket»:** legg til `FR-33`.
- **Ny story etter Story 1.11:**

> ### Story 1.12: Se de beste stedene akkurat nå *(ny 2026-11-18)*
>
> **Prioritet:** Bør ha
>
> As en bruker som åpner SnowFinder for å se hvor det er best i dag,
> I want å se de tre beste stedene øverst på forsiden,
> So that jeg får svaret uten å bytte visning eller lete på kartet. Realiserer FR-33.
> Kommer fra [endringsforslaget om «Best akkurat nå»](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-11-18-best-akkurat-naa.md).
>
> **Acceptance Criteria:**
>
> **Given** Utforsk i kart- eller listevisning uten filter, med demodata
> **When** siden vises
> **Then** står overskriften «Best akkurat nå» over kartet eller listen, med de tre stedene som har høyest SnowScore, i samme rekkefølge som de tre første i listen sortert etter score
> **And** hvert sted viser navnet og score-badge med tall og poengnivå, og er én lenke til stedssiden med filteret og visningen i adressen som i Story 3.2b
>
> **Given** et aktivt filter med minst ett treff
> **When** siden vises
> **Then** heter overskriften «Best blant treffene», og raden viser høyst tre av treffene, valgt og sortert på samme måte
>
> **Given** filteret gir null treff, eller ingen av treffene har poengsum
> **When** siden vises
> **Then** vises ikke raden
>
> **Given** treff med lik SnowScore, eller treff med ufullstendige data
> **When** raden velger steder
> **Then** avgjøres lik score av navnet som i listen, og steder med ufullstendige data er aldri med
>
> **And** raden står mellom søkefeltet og filteret eller kartet på alle bredder, aldri i bunn-arket, og under 768 px tar hvert sted én linje uten sideveis rulling
> **And** raden er en `section` med en `h2`-overskrift og en ordnet liste. Utvalget er en ren funksjon med enhetstester for rekkefølge, lik score, ufullstendige data og færre enn tre treff
> **And** E2E-testen i demomodus åpner det første stedet fra raden og kjører axe på Utforsk med raden synlig

### 4.3 UX (`SnowFinder-EXPERIENCE.md` og kopien `EXPERIENCE.md`)

**Komponentmønstre, ny rad etter «Søkefelt»:**

> | Best akkurat nå *(Story 1.12)* | Utforsk, mellom søkefeltet og filteret eller kartet, på alle bredder | Overskriften er «Best akkurat nå», eller «Best blant treffene» når et filter er aktivt. Under den står høyst tre steder med høyest SnowScore blant treffene, i samme rekkefølge som listen sortert etter score. Hvert sted er én lenke med navnet og score-badge og åpner stedssiden. Steder med ufullstendige data er ikke med. Raden vises ikke ved null treff, der null treff-kortet står, og heller ikke når ingen treff har poengsum. Under 768 px tar hvert sted én linje. Raden ligger aldri i bunn-arket. |

**Responsivt design, punktet «Mobil (<768px)». Ny setning etter første setning:**

> Over kartet og listen står søkefeltet og raden «Best akkurat nå» (Story 1.12). Raden har høyst tre linjer, så kartet starter fortsatt på første skjerm.

### 4.4 SnowFinder-PRD-og-SRS.html (versjon 2.4)

- **F3.5** under F3 i PRD-fanen: «*(Bør ha)* Brukeren ser de tre beste stedene blant treffene øverst på Utforsk og åpner et sted med ett trykk. (SRS-F-35)»
- **SRS-F-35** i SRS-tabellen for F3: samme tekst som konsekvensene i FR-33. Prioritet B, verifisering T, kilde FR-33.
- **Endringslogg for versjon 2.4:** «Ny F3.5 og SRS-F-35 etter FR-33 i PRD-en (sprint-change-proposal-2026-11-18-best-akkurat-naa.md).»
- Tittelen sier versjon 2.4, 2026-11-18.

### 4.5 Plan og status

- **`sprint-status.yaml`:** `epic-1: in-progress  # Story 1.12 lagt til 2026-11-18` og en ny linje `1-12-se-de-beste-stedene-akkurat-naa: backlog`.
- **`sprintplan.md`:** et nytt avsnitt «Avvik (2026-11-18)»: «Story 1.12 (Best akkurat nå) er lagt til etter endringsforslaget fra 2026-11-18 og bygges etter rettingene, før kodefrysen 28. november. Den er et vedtatt unntak fra regelen om ingen nye stories etter 16. november.»
- **`fremdriftsplan.md`:** «Hvor er vi nå?» sier at endringsforslaget er godkjent, og at Story 1.12 venter.

## 5. Overlevering

- **Omfang:** lite. Amelia (`bmad-build`) bygger Story 1.12 direkte på greinen `story/1-12-best-akkurat-naa`, med review fra et gruppemedlem før merge.
- **Rekkefølge:** først PR-en med rettingene fra gjennomgangen (`fix`), deretter Story 1.12. Begge før kodefrysen 28. november.
- **Ferdig når:**
  - alle akseptkriteriene har tester som kjører;
  - lint, typecheck, test, `build:demo` og `test:e2e` er grønne i CI;
  - et gruppemedlem har godkjent PR-en;
  - storyen står som `done` i `sprint-status.yaml`, og fremdriftsplanen er oppdatert.

## 6. Godkjenning

Godkjent av Aksel 2026-11-18 («ja godkjent. gjør endringene og kjør pr»), med alle valgene i §3 som anbefalt.
