# 2026-10-29: Story 1.6, hold tjenesten oppe når en datakilde er nede

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5) i VS Code, `bmad-build` (Amelia, dispatch) med subagenter: epic-kontekst, implementering og tre gjennomgangslag (Blind Hunter, Edge Case Hunter, Verification Gap)
**Fase:** Gjennomføring
**Resultat:** Nye forsøk i `scripts/pipeline/fetch.ts` (nettverksfeil, 429 og 5xx, inntil tre forsøk med 1 s og 2 s pause, gjennom kallporten), banneret «Viser siste kjente data fra kl. HH:MM» på Utforsk og stedssiden når datafila er over 90 min gammel, tester (enhet, run og E2E med axe), `spec-1-6-hold-tjenesten-oppe.md`, ny `epic-1-context.md`, to nye punkter i `deferred-work.md`

## Prompter

### 1
> er du koblet til g18?

**Svar (kort):** Ja, lokal klon av `IBE160-2026/G18-bikila-dymbe-gela-james` på `main`, men GitHub CLI (`gh`) manglet.
**Hva vi gjorde med det:** Brukt som utgangspunkt.

### 2
> er du ferdig med story 1.6?

**Svar (kort):** Nei, 1.6 sto som `backlog`. Siste gyldige fil fantes fra 1.5, men nye forsøk og banneret manglet.
**Hva vi gjorde med det:** Bestemte å bygge storyen.

### 3
> start story 1.6

**Svar (kort):** `bmad-build` stoppet fordi verktøyet `uv` manglet på maskinen.
**Hva vi gjorde med det:** Installerte `uv` og `gh` (uten administratortilgang, siden `winget` mangler på skolemaskinen).

### 4
> er du tilkoblet github ?

**Svar (kort):** Git nådde GitHub, men `gh` manglet, så PR-er og CI-sjekker kunne ikke følges.
**Hva vi gjorde med det:** Limte inn terminalutskriften fra installasjonsforsøkene (`winget` fantes ikke) og fikk kommandoer som installerer `gh` og `uv` i brukermappen. `gh` ble logget inn som PoleDuNord.

### 5
> (limte inn utskriften fra installasjonen av `uv` 0.13.6)

**Svar (kort):** `uv` og `gh` virket. Lokal `main` lå 69 commits bak og ble oppdatert før grenen `story/1-6-hold-tjenesten-oppe` ble laget.
**Hva vi gjorde med det:** Brukt.

### 6 (valg i dialogene)
> Subagenter: «Ja, bruk subagenter (Anbefalt)». Omfang: «Behold begge (Anbefalt)».

**Svar (kort):** Epic 1-konteksten ble laget på nytt av en subagent, og specen fikk både nye forsøk og banneret.
**Hva vi gjorde med det:** Brukt.

### 7
> continue

(Etter at jeg lukket dialogen om bannerfarge og spec-størrelse.) **Svar (kort):** Claude stilte de to spørsmålene som tekst. DESIGN.md sin `warning`-bakgrunn med `ink-primary`-tekst gir bare kontrast 2,92:1, under WCAG AA.
**Hva vi gjorde med det:** Se 8.

### 8
> A

**Svar (kort):** Banneret får hvit bakgrunn (`surface-raised`) med kant i `warning` og mørk tekst (16,6:1). Hele specen ble beholdt.
**Hva vi gjorde med det:** Godtok Claudes egne valg: alder fra `generert` i stedet for METs tidsstempel (unngår falske bannere), ingen nye forsøk ved tidsavbrudd (en kjøring på rundt en time ville kollidert med timesjobben), og ingen årsak i banneret.

### 9
> Godkjenn og fortsett

**Svar (kort):** En subagent implementerte specen. Tre gjennomgangslag ga 22 funn: 9 rettet (blant annet test for HTTP 500, at banneret leses opp av skjermleser, og rettet epic-kontekst), 1 utsatt (tidsbudsjett for trege 5xx-svar) og resten avvist med begrunnelse i spec-ens Review Triage Log.
**Hva vi gjorde med det:** Godkjent. Lint, typecheck, 629 tester, build og 124 E2E-tester grønne lokalt.

### 10 (valg i dialogen)
> Hvem: «Joseph». Git-identitet: «Ja, bare for dette repoet (Anbefalt)». Fordeling: «Ja, det er avklart».

**Svar (kort):** Git-identitet satt lokalt i repoet. Fremdriftsplanen sier at 1.6 er bygget av Joseph etter avtale med Aksel.
**Hva vi gjorde med det:** Brukt.
