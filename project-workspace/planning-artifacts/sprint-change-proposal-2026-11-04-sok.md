# Endringsforslag 2026-11-04: søk på stedsnavn i Utforsk

**Status:** godkjent av Aksel 2026-11-04 («Godkjenn og bygg»)
**Modus:** samlet
**Omfang:** lite (direkte justering, én ny story)

## 1. Problemet

I dag kan brukeren bare finne et bestemt sted ved å lete på kartet eller bla i listen. Det finnes ikke noe søkefelt.

- **Brukertesten krever det:** tre av fem oppgaver i brukertestplanen (`SnowFinder-EXPERIENCE.md`) ber deltakeren finne et bestemt sted. Det er oppgave 2 (Hafjell), oppgave 3 (Gaustatoppen) og oppgave 5 (Kirkenes). Uten søk måles disse oppgavene mest på hvor godt deltakeren kjenner norsk geografi. SM-3, SM-4 og 80 %-målet for oppgaver uten hjelp blir da svakere bevis for at SnowFinder er lett å bruke.
- **Kilden:** et gruppemedlem spurte om Utforsk kunne være søkbar i stedet for at man bare trykker på kartet. Spørsmålet ble vurdert i gjennomgangen av PRD/SRS v2 (2026-11-04), der søk ble foreslått som krav SRS-F-32.
- **Type:** et nytt krav fra gruppa. Ingen eksisterende krav er feil.
- **Avvik fra SRS-F-32 i PRD/SRS v2:** v2 ville vise steder med for gamle data i søket. Det strider mot NFR-3 og tilstanden «Data for gammel» i EXPERIENCE.md, der stedet er «faktisk fjernet, så brukeren aldri handler på for gammel info». `useSteder` fjerner dem også før Utforsk får dataene. Søket følger derfor NFR-3, og SRS-F-32 rettes tilsvarende.

## 2. Hva endringen berører

| Område | Endring |
|---|---|
| PRD | Ny **FR-32: Søk på stedsnavn** *(Må ha)* i §4.3, ny brukerreise **UJ-4**, og FR-32 i §6.1. Beskrivelsen i §4.3 får tre innganger i stedet for to. |
| Epics | Ny **Story 3.9: Søk etter et sted ved navn** i Epic 3. FR-32 føres i kravinventaret og dekningskartet. |
| Andre stories | Ingen endres. Story 3.2b er uendret: stedssidens adresse bærer filteret, og søkets lenker bruker den samme adressen. |
| Arkitektur | Ingen endring. Søkelogikken er ren og deterministisk, så den legges i `shared/` etter AD-6, med en fasittabell etter AD-4. Søket leser de samme stedene som kart og liste (AD-8). Ingen ny datakontrakt. |
| UX | Ny komponent **Søkefelt** og ny tilstand **Ingen søketreff** i `SnowFinder-EXPERIENCE.md`, og en ny flyt 5. Plasseringen beskrives under. |
| DESIGN.md | Ingen nye tokens. Feltet og forslagslisten bruker de eksisterende tokenene for inndata, kort og fokus. |
| Brukertestplanen | Ingen endring i oppgavene. Søket gjør oppgave 2, 3 og 5 raskere. |
| sprint-status.yaml | Ny linje `3-9-søk-etter-et-sted-ved-navn: backlog`, og `epic-3` går fra `done` til `in-progress`. |
| sprintplan.md | Story 3.9 legges i sprint 4, med avviket forklart. |
| Avhengigheter, nøkler og tjenester | Ingen nye. Søket kjører i nettleseren på datafila som allerede er lastet. |

**Ikke med:** fargeforklaring for kartet (SRS-F-15 i PRD/SRS v2). Den føres i `deferred-work.md` og får eget endringsforslag hvis gruppa vil ha den.

## 3. Anbefalt løsning: direkte justering

Én ny story i Epic 3, som allerede eier det å finne steder. Ingen rollback og ingen endring i MVP-målene, bare ett nytt Må ha-krav.

- **Innsats:** lav til middels. Én ren funksjon med fasittabell, én komponent, enhetstester og en E2E-test.
- **Risiko:** lav. Søket leser data og endrer ikke filteret, adressen eller datafila. Den største risikoen er tilgjengeligheten, fordi en combobox er lett å bygge feil. Den dekkes av axe i E2E og av tastaturtester.
- **Tid:** én story, ventet ferdig før brukertesten.

Andre løsninger som ble vurdert:

- **Navnefilter i listen:** et tekstfelt som bare filtrerer listevisningen. Det er enklere, men hjelper ikke på kartet og skjuler steder på samme måte som filteret. Forkastet.
- **Søk som filterkrav i adressen:** da kunne man dele et søk, men det blander «finn ett sted» med «finn steder som oppfyller krav» og gjør null treff-forslaget i Story 3.3 mer komplisert. Forkastet. Å dele ett sted gjøres med stedssidens adresse.

## 4. Endringene i detalj

### 4.1 PRD (`SnowFinder-PRD.md` og kopien `prd.md`)

**§2.3, ny brukerreise etter UJ-3:**

> - **UJ-4. Mari sjekker ett bestemt sted.** *(v5, 2026-11-04)*
>   - **Person + kontekst:** Mari har hytte på Beitostølen og vil bare vite hvordan forholdene er der.
>   - **Inngangstilstand:** Ingen konto. Åpner SnowFinder på mobil.
>   - **Sti:** (1) Skriver «beito» i søkefeltet over kartet. (2) Får forslag mens hun skriver. (3) Velger «Beitostølen».
>   - **Klimaks:** Stedssiden åpnes direkte, uten at hun har lett på kartet.
>   - **Edge case:** Filteret hennes skjuler stedet. Søket viser det likevel, merket «Oppfyller ikke filteret», så hun ser at stedet finnes.

**§4.3, beskrivelsen. GAMMELT:**

> To likeverdige måter å utforske katalogen på: et visuelt kart for de fleste, og en tastaturnavigerbar listevisning […]. Realiserer UJ-1 (kart) og UJ-3 (liste).

**NYTT:**

> To likeverdige måter å utforske katalogen på: et visuelt kart for de fleste, og en tastaturnavigerbar listevisning […]. I tillegg et søkefelt for den som vet hvilket sted hen vil se *(v5)*. Realiserer UJ-1 (kart), UJ-3 (liste) og UJ-4 (søk).

**§4.3, nytt krav etter FR-15:**

> #### FR-32: Søk på stedsnavn *(Må ha, v5, 2026-11-04)*
>
> Utforsk har et søkefelt for stedsnavn i både kart- og listevisning. Søket kjører i nettleseren på stedene i datafila, uten søketjeneste.
>
> **Konsekvenser (testbare):**
> - Søket skiller ikke mellom store og små bokstaver, og tåler æ, ø og å skrevet som ae, o og a (og omvendt).
> - Et sted er et treff når søketeksten er starten på et ord i navnet («skisenter» finner «Hemsedal skisenter»). Treff der hele navnet starter med søketeksten, kommer først, deretter alfabetisk.
> - Høyst 8 forslag vises mens brukeren skriver, fra første tegn.
> - Steder som er skjult av filteret eller har ufullstendige data, vises også, med statusen som tekst. Steder med data eldre enn 12 timer er fjernet (NFR-3) og finnes heller ikke i søket.
> - Et valgt treff åpner stedssiden med mus, berøring eller Enter.
> - Ved null treff står det at stedet ikke finnes, og hvor mange steder SnowFinder dekker.
> - Søketeksten påvirker ikke filteret og står ikke i adressen.
> - En fasittabell for søket kjøres som CI-blokkerende test mot den delte søkefunksjonen.
>
> *Begrunnelse:* tre av fem oppgaver i brukertesten ber deltakeren finne et bestemt sted (sprint-change-proposal-2026-11-04-sok.md).

**§6.1, linjen om kart og liste. GAMMELT:**

> - Norgeskart **og** tilgjengelig listevisning som likeverdig alternativ (§4.3)

**NYTT:**

> - Norgeskart **og** tilgjengelig listevisning som likeverdig alternativ, med søk på stedsnavn (§4.3, FR-32) *(v5)*

Frontmatter: `updated: 2026-11-04`.

### 4.2 Epics (`SnowFinder-Epics-og-Stories.md`)

- **Kravinventar:** ny linje `FR-32: Søk på stedsnavn (i nettleseren, shared/) — Må ha (v5, 2026-11-04)`.
- **FR-dekningskart:** `FR-14, FR-15, FR-20 til FR-26, FR-32: Epic 3`.
- **Epic 3-beskrivelsen:** tillegget «og finne ett bestemt sted ved navn», og `FR-32` i «FRs dekket».
- **Ny story etter Story 3.8:**

> ### Story 3.9: Søk etter et sted ved navn *(ny 2026-11-04)*
>
> **Prioritet:** Må ha
>
> As en bruker som vet hvilket sted jeg vil se,
> I want å skrive navnet i et søkefelt og få forslag,
> So that jeg kommer rett til stedssiden uten å lete på kartet. Realiserer FR-32. Realiserer UJ-4.
>
> **Acceptance Criteria:**
>
> **Given** Utforsk i kart- eller listevisning med publiserte data
> **When** jeg skriver «beito» i søkefeltet
> **Then** viser forslagslisten «Beitostølen» mens jeg skriver, uten at filteret, adressen eller trefftallet endres
>
> **Given** søketekst med en annen skrivemåte, for eksempel «tromso», «TRYSIL» eller «skisenter»
> **When** søket kjøres
> **Then** finnes de samme stedene som med riktig skrivemåte, etter reglene i FR-32, og rekkefølgen og grensen på 8 forslag følger fasittabellen `tests/golden/sok.json`
>
> **Given** et sted som er skjult av filteret eller har ufullstendige data
> **When** jeg søker etter det
> **Then** står det i forslagslisten med statusen som tekst («Oppfyller ikke filteret» eller «Ufullstendige data»)
> **And** et sted med data eldre enn 12 timer finnes ikke i søket, på samme måte som det ikke finnes i kart og liste (NFR-3)
>
> **Given** forslagslisten er åpen
> **When** jeg velger et forslag med mus, berøring eller piltaster og Enter
> **Then** åpnes stedssiden, med filteret og visningen i adressen som i Story 3.2b, og «Tilbake» går tilbake til Utforsk
>
> **Given** en søketekst uten treff
> **When** søket kjøres
> **Then** viser listen «Fant ingen steder som heter «…». SnowFinder dekker N steder i Norge.», der N er antall steder i datafila
>
> **And** feltet følger ARIA-mønsteret for combobox (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`). Antall forslag annonseres med `aria-live="polite"`, og Escape lukker listen og tømmer feltet ved andre trykk
> **And** søkefunksjonen er én ren funksjon i `shared/` (AD-6) med fasittabell (AD-4), og E2E-røyktesten søker opp et sted i demomodus og kjører axe på Utforsk med åpen forslagsliste
> **And** feltet ligger over kartet og listen på alle bredder, aldri inne i bunn-arket under 768 px

### 4.3 UX (`SnowFinder-EXPERIENCE.md` og kopien `EXPERIENCE.md`)

**Informasjonsarkitektur, raden «Stedsside», kolonnen «Nås fra». GAMMELT:**

> Trykk på kartmarkør, listerad, eller direkte delt lenke `/sted/:id`

**NYTT:**

> Trykk på kartmarkør, listerad, søkeforslag eller direkte delt lenke `/sted/:id`

**Komponentmønstre, ny rad etter «Kart | Liste-veksling»:**

> | Søkefelt *(Story 3.9)* | Utforsk, mellom Kart \| Liste-vekslingen og kartet eller listen, på alle bredder | Etiketten «Søk etter sted» er synlig over feltet. Forslag vises fra første tegn, høyst 8, i en liste rett under feltet. Hvert forslag viser stedsnavnet og score-badge, eller statusen som tekst («Oppfyller ikke filteret», «Ufullstendige data»). Steder med for gamle data er fjernet og finnes ikke i søket. Når alle steder er fjernet («Ingen ferske data»), vises heller ikke søkefeltet. Pil opp og ned flytter markeringen, Enter åpner stedssiden, og Escape lukker listen (andre trykk tømmer feltet). Et klikk utenfor lukker listen. Søketeksten står ikke i adressen og endrer aldri filteret eller trefftallet. Antallet forslag annonseres med `aria-live="polite"`. Feltet ligger aldri i bunn-arket. |

**Tilstandsmønstre, ny rad etter «Null treff»:**

> | Ingen søketreff | Søkefeltet | «Fant ingen steder som heter «…». SnowFinder dekker N steder i Norge.» i forslagslisten. Filteret, kartet og listen er uendret. |

**Nøkkelflyter, ny flyt etter flyt 4:**

> ### Flyt 5 — Mari sjekker ett bestemt sted (realiserer UJ-4) *(2026-11-04)*
>
> 1. Mari åpner SnowFinder på mobil. Kartet lastes.
> 2. Hun skriver «beito» i søkefeltet over kartet. Forslaget «Beitostølen» vises med score-badge.
> 3. Hun trykker forslaget, og stedssiden åpnes.
>
> Feil-gren: Filteret skjuler Beitostølen → forslaget står likevel, merket «Oppfyller ikke filteret». Hun kan åpne stedssiden eller nullstille filteret.

**Wireframe:** ingen ny. Wireframen for Utforsk får en merknad om søkefeltet når Sally (`bmad-ux`) oppdaterer den neste gang.

### 4.4 Statusfiler

- `sprint-status.yaml`: `epic-3: in-progress` og ny linje `3-9-søk-etter-et-sted-ved-navn: backlog`.
- `sprintplan.md`: Story 3.9 legges i sprint 4, med merknaden «Avvik 2026-11-04: Story 3.9 (søk) er lagt til etter endringsforslaget om søk og bygges før brukertesten.»
- `deferred-work.md`: ny oppføring om fargeforklaringen.

## 5. Overlevering

- **Omfang:** lite. Amelia (`bmad-build`) bygger Story 3.9 direkte fra denne storyen.
- **Rekkefølge:** først denne dokumentasjonsendringen på grenen `docs/endringsforslag-sok`, deretter storyen på `story/3-9-sok-etter-sted`.
- **Review:** storyen trenger godkjenning fra et annet gruppemedlem på GitHub, som andre story-PR-er.
- **Ferdig når:** alle akseptkriteriene i Story 3.9 har tester som kjører, fasittabellen og E2E med axe er grønne i CI, og README nevner søket der Utforsk er beskrevet.
