---
name: sesjonslogg
description: Dokumenterer arbeidssesjonen i `.logs/` i prosjektroten (Oppgave + Plan + Resultat + åpne punkter) og vedlikeholder åpne punkter som `Agent`-merkede Issues gjennom `book issues`, slik at sluttoppsummeringer og «husk at»-punkter ikke forsvinner i chat-scrollback. Bruk denne ved slutten av ENHVER arbeidsøkt eller fullført oppgave som endret tilstand — også små mekaniske økter som en commit, push, publisering eller konfig-endring — alltid før du skriver sluttoppsummeringen til brukeren, og særlig når oppsummeringen inneholder «åpne punkter», «gjenstår», «husk at», «legg merke til», «neste steg», «ikke gjort» eller lignende. Bruk den også når brukeren sier «logg sesjonen», «logg dette», «oppdater loggen», «skriv sesjonslogg», og når du trenger å vite hva som ble gjort i en tidligere sesjon (les da `.logs/` og hent Agent-Issues med book-CLI-en i stedet for å gjette).
---

# Sesjonslogg

Formål: brukeren leser ikke alltid sluttoppsummeringen i terminalen, og den forsvinner uansett når vinduet lukkes. Hva som ble gjort og bevisst *ikke* ble gjort skal overleve som Markdown i `.logs/`; hvert reelt «husk at …» / «gjenstår …»-punkt skal i tillegg overleve som et søkbart Issue i akseptansebasen. Loggen er brukerens sesjonshukommelse, mens Issues er prosjektets oppgaveliste.

## Hvor og når

- Finn prosjektroten med `git rev-parse --show-toplevel` (i et git-worktree: worktreets egen rot). Loggmappen er `<rot>/.logs/<bruker-slug>/` — én mappe per bruker, slik at hver bruker ser sine egne økter adskilt. Slugen er kebab-case av `git config user.name` (f.eks. `bard-pettersen`; mangler navnet, bruk local-part av `user.email`). Opprett mappen hvis den mangler.
- Skriv loggen når en oppgave/økt avsluttes, **før** du skriver sluttoppsummeringen til brukeren — da er alt ferskt, og oppsummeringen kan gjenbruke teksten. I lange økter: oppdater gjerne loggen underveis ved milepæler.
- Rene småspørsmål-økter (ett faktasvar, ingenting endret, ingenting å huske) trenger ikke logg. Alt annet logges.
- Testen for «trenger ikke logg» er **om økten endret tilstand** — ikke hvor liten oppgaven føltes. En commit, push, publisering, migrasjon, seeding eller konfig-endring er tilstandsendring og skal logges selv om den bare tok to kommandoer: det er nettopp de små mekaniske øktene som glemmes først, og loggen er eneste sted et fremtidig «når ble dette pushet, og hva lå i det?» kan besvares. To følgeregler:
  - En økt som *starter* som et spørsmål («er X à jour?») men *ender* i en handling («commit og push det») er ikke lenger en spørsmålsøkt.
  - Inneholder sluttoppsummeringen din et «merk at …»/«husk …»/«gjenstår …»-punkt, har du allerede bevist at økten har noe å miste i scrollback — da logges den, uansett størrelse.

## Ny fil eller fortsettelse?

List filene i **din egen** brukermappe (`.logs/<bruker-slug>/`) først.

- Finnes det en fil der som dokumenterer **samme arbeid/feature** som denne økten fortsetter på? → Gjenbruk den fila: legg en ny dato-seksjon nederst. Filnavnet (med det opprinnelige nummeret og tidsstempelet) beholdes. Ble samme arbeid sist logget av en *annen* bruker (fila ligger i deres mappe), lag i stedet en ny fil i din egen mappe og lenk til deres fil i Plan-seksjonen (`../per-kristian-rekdal/NNN-….md`) — skriv aldri i en annen brukers mappe.
- Nytt arbeid → ny fil: `NNN-yyyy-mm-dd-HH-MM-SS-<tittel>.md` — et **tresifret nedtellende løpenummer** først, deretter dagens dato og klokkeslettet (24-timers, med bindestreker: `14-31-07`). NNN starter på `999` i en tom mappe; neste fil får laveste eksisterende nummer i mappen − 1 (`998`, `997`, …). Nedtellingen gjør at nyeste fil alltid ligger øverst ved vanlig stigende sortering — også på tvers av dager. Klokkeslettet står i tillegg i dato-overskriften inne i fila (se malen). Tittelen er kebab-case og beskrivende — helst feature-navnet: `999-2026-08-08-14-31-07-kurstab-redesign.md`, aldri noe generisk som `…-sesjon.md`.
- Har du allerede logget denne økten i dag (samme fil har en seksjon med dagens dato for samme arbeid)? → Oppdater dagens seksjon i stedet for å legge til en dublett.

## Format

Skriv på samme språk som brukeren. Mal — `# Tittel` kun øverst i en ny fil; hver økt får sin `## dato`-seksjon:

```markdown
# Kurstab-redesign

## 2026-08-08 kl. 14:31 — Bård Pettersen

### Oppgave
Hva brukeren ba om, med intensjonen bak — 1–3 setninger.

### Plan
- Punktliste over den faktiske fremgangsmåten (kort — dette er ikke plandokumentet).
- Finnes det et lagret plandokument (PLAN.md, .docs/plans/…, godkjent plan fra plan-modus
  skrevet til fil), lenk til det her — brukeren skal kunne spore nøyaktig hva planen var.

### Resultat
Hva som ble gjort: endrede filer/områder, commits (hash hvis committet), migrasjoner,
testresultater, hva som ble verifisert. Konkret nok til at en fremtidig sesjon kan
bygge videre uten å gjette.

### Åpne punkter
- Alt som gjenstår, ble bevisst utsatt, eller må huskes. Oppgi `Issue #N` for hvert punkt som er opprettet med `book issues`.
- Skriv «Ingen.» hvis det ikke er noen.
```

Dato-overskriften bærer klokkeslettet for når loggen skrives **og hvem som kjørte oppgaven**: `## yyyy-mm-dd kl. hh:mm — <utfører>` (24-timers; `date "+%F kl. %H:%M"` / `Get-Date -Format "yyyy-MM-dd 'kl.' HH:mm"`). Utføreren er git-brukeren: `git config user.name` (fall tilbake på `user.email`, eller utelat hvis begge mangler). Fortsettelser: legg `## <ny dato> kl. <tid> — <utfører>` **nederst** i den eksisterende fila, med de samme fire underseksjonene — slik ser man også hvem som kjørte hver økt.

## Hva er (ikke) et åpent punkt?

Et åpent punkt er noe som gjenstår i selve produktet eller prosjektet: en manglende test, en kjent bug, konfig som må settes ved deploy, en beslutning som venter, noe brukeren eksplisitt ba deg huske. Git- og prosesstatus er **ikke** åpne punkter — brukeren ser git-status selv, og slike punkter drukner de ekte. (I Resultat-seksjonen kan commit-hash eller «ukommittert» nevnes kort som faktum.) Eksempler på ting som IKKE skal inn i Åpne punkter eller opprettes som Issues:

- «Ingen av endringene er committet — husk å committe.» / «må pushes»
- Samordningsbeskjeder om repo-tilstand: «NN må `git pull` / re-synke klonene sine»
- Observasjoner om førtilstand: «fil X sto som endret/utracket før økten — avklar før commit»

Unntaket er når tilstanden er reelt kritisk — f.eks. en migrasjon er kjørt mot en delt database mens koden ikke er delt, slik at andre kan rammes.

## Issues gjennom book-CLI-en

`.logs/<bruker-slug>/issues.md` er utfaset. **Aldri opprett, les eller oppdater
den fila.** Den samlede oppgavelista er Issues i akseptansebasen, og alle
agentopprettede punkter har etiketten `Agent` (`agent`).

1. Sørg for at repoets `book`-kommando er installert etter prosjektets
   `book-cli`-skill, og sett UTF-8 i Windows-skallet. Kjør `book issues actors`.
   Følg en eksplisitt slug/aktør-mapping i prosjektets agentreferanser hvis den
   finnes. Ellers: finn den menneskelige aktøren som tilsvarer git-brukeren,
   helst med eksakt e-post, ellers eksakt/entydig visningsnavn. Bruk aktørens
   UUID som `AKTØR` i resten av økten. Ikke skriv på vegne av en annen person;
   be brukeren avklare hvis treffet ikke er entydig.
2. **Les åpne punkter** før du logger:
   `book issues list --state open --label agent --author AKTØR --all`.
   Les aktuelle kandidater med `book issues get NUMMER`; ikke konkluder fra
   tittelen alene.
3. **Lukk punkter økten løste**, også eldre punkter. Bruk revisjonen fra `get`:
   `book issues update NUMMER --expected-revision REV --state closed --by AKTØR`.
   Utelat `--label` ved lukking, slik at eksisterende etiketter bevares. Referer
   nummeret i Resultat (`Løser Issue #N`).
4. **Opprett ett Issue per nytt åpent punkt** før sesjonsfila skrives. Hent
   commit-SHA med `git rev-parse HEAD`, og kjør:
   `book issues create --title "kort, konkret tittel" --body "detaljer, hvorfor det gjenstår, og relativ sti til planlagt sesjonslogg" --label agent --environment local --target-commit SHA --by AKTØR`.
   Bruk nummeret fra svaret i sesjonsfilas Åpne punkter (`Issue #N — …`). Ikke
   opprett et Issue for `Ingen.` og ikke dupliser et eksisterende åpent Issue.
5. Issue-numre er globale og monotone. Ved en revisjonskonflikt: hent issuet på
   nytt, kontroller at du fortsatt bør endre det, og prøv mot fersk revisjon.

## Forankring i CLAUDE.md/AGENTS.md

Sjekk ved hver bruk om prosjektets rot-`CLAUDE.md` eller `AGENTS.md` refererer til denne skillen (`sesjonslogg`). Gjør ingen av dem det, **legg referansen inn** — det er den instruksen som sørger for at fremtidige økter i prosjektet faktisk logger; skill-beskrivelsen alene er ingen garanti for trigging.

- Legg regelen der prosjektets agent-instruksjoner faktisk bor: i `AGENTS.md` hvis den finnes (eller hvis `CLAUDE.md` bare er en `@AGENTS.md`-import), ellers i `CLAUDE.md`; finnes ingen av dem, opprett `CLAUDE.md` med regelen.
- Hold den kort og tilpass filens eksisterende struktur og språk, f.eks.:
  > **Logg sesjonen.** Når en oppgave/økt avsluttes — før sluttoppsummeringen — bruk `sesjonslogg`-skillen: den logger Oppgave + Plan + Resultat + åpne punkter per bruker i `.logs/<bruker>/` og oppretter/lukker åpne punkter som `Agent`-merkede Issues via `book issues`.
- Ikke dupliser: står referansen alt et sted i en av filene, er alt i orden.

## Ved oppstart av en fortsettelse

Når brukeren refererer til tidligere arbeid («fortsett med …», «hva gjorde vi sist med …»), les den relevante fila i `.logs/` (brukerens egen mappe først, deretter eventuelt andre brukeres), finn aktøren med `book issues actors`, og hent vedkommendes åpne `Agent`-Issues med `book issues list --state open --label agent --author AKTØR --all` **før** du begynner. Les aktuelle Issues med `book issues get NUMMER`; dette er raskere og sikrere enn å rekonstruere fra koden eller hukommelsen.
