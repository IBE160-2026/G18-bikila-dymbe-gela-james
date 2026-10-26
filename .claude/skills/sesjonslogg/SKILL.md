---
name: sesjonslogg
description: Dokumenterer arbeidssesjonen i `.logs/` i prosjektroten (Oppgave + Plan + Resultat + åpne punkter) og vedlikeholder åpne punkter i `issues.md`, slik at sluttoppsummeringer og «husk at»-punkter ikke forsvinner i chat-scrollback. Bruk denne ved slutten av ENHVER arbeidsøkt eller fullført oppgave som endret tilstand — også små mekaniske økter som en commit, push, publisering eller konfig-endring — alltid før du skriver sluttoppsummeringen til brukeren, og særlig når oppsummeringen inneholder «åpne punkter», «gjenstår», «husk at», «legg merke til», «neste steg», «ikke gjort» eller lignende. Bruk den også når brukeren sier «logg sesjonen», «logg dette», «oppdater loggen», «skriv sesjonslogg», og når du trenger å vite hva som ble gjort i en tidligere sesjon (les da `.logs/` og `issues.md` i stedet for å gjette).
---

# Sesjonslogg

Formål: brukeren leser ikke alltid sluttoppsummeringen i terminalen, og den forsvinner uansett når vinduet lukkes. Hva som ble gjort og bevisst *ikke* ble gjort skal overleve som Markdown i `.logs/`; hvert reelt «husk at …» / «gjenstår …»-punkt skal i tillegg overleve som en linje i `issues.md`. Loggen er brukerens sesjonshukommelse, mens `issues.md` er den samlede lista over det som gjenstår.

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
- Alt som gjenstår, ble bevisst utsatt, eller må huskes. Hvert punkt speiles i `issues.md` (se under).
- Skriv «Ingen.» hvis det ikke er noen.
```

Dato-overskriften bærer klokkeslettet for når loggen skrives **og hvem som kjørte oppgaven**: `## yyyy-mm-dd kl. hh:mm — <utfører>` (24-timers; `date "+%F kl. %H:%M"` / `Get-Date -Format "yyyy-MM-dd 'kl.' HH:mm"`). Utføreren er git-brukeren: `git config user.name` (fall tilbake på `user.email`, eller utelat hvis begge mangler). Fortsettelser: legg `## <ny dato> kl. <tid> — <utfører>` **nederst** i den eksisterende fila, med de samme fire underseksjonene — slik ser man også hvem som kjørte hver økt.

## Commit loggfila (alltid)

Etter at loggfila er skrevet (ny fil, ny dato-seksjon eller oppdatert dagens seksjon), **skal** den committes umiddelbart, før sluttoppsummeringen. Ellers blir loggene glemt som ukommitterte filer og kommer ut av sync mellom brukere og maskiner. Dette er et krav, ikke et valg — ikke spør om lov, og hopp det ikke over fordi økten var liten.

**Commit kun loggfila og `issues.md` — ingenting annet.** `issues.md` oppdateres i samme økt (se under), og må med, ellers blir den stående ukommittert og kommer ut av sync. Andre endringer i arbeidskopien (kode, konfig, utracket filer, ting brukeren selv har staget) skal ikke bli med. Bruk en path-begrenset commit, slik at annet som allerede ligger i staging-området ikke dras med:

```sh
git add -- ".logs/<bruker-slug>/<fil>.md" ".logs/<bruker-slug>/issues.md"
git commit -m "Logg: <tittel>" -- ".logs/<bruker-slug>/<fil>.md" ".logs/<bruker-slug>/issues.md"
```

- Meldingen er `Logg: <tittel>` (tittelen er den samme som i fila, f.eks. `Logg: kurstab-redesign`), pluss eventuelle attribusjonslinjer harnessen krever for commits. Angir prosjektets `CLAUDE.md`/`AGENTS.md` en egen commit-meldingskonvensjon for logger, følg den i stedet.
- Var `issues.md` uendret i økten (eller finnes den ikke), utelates den fra kommandoene, og bare loggfila committes.
- Kontroller etterpå med `git show --stat HEAD` at commiten inneholder nøyaktig disse filene: loggfila og eventuelt `issues.md`. Inneholder den mer, angre med `git reset --soft HEAD~1`, unstage det som ikke hører til, og commit på nytt.
- **Ikke push** med mindre brukeren ber om det i økten. Skillen committer bare lokalt.
- Er `.logs/` git-ignorert, eller er prosjektet ikke et git-repo, hopp over commit og nevn det kort i sluttoppsummeringen.
- Hook-feil: løs årsaken og commit på nytt. Aldri `--no-verify`.
- Loggfila kan ikke selv inneholde hashen til sin egen commit. Under «Resultat» refererer du til commit-hasher for det *arbeidet* som ble gjort, ikke til loggcommiten.

## Hva er (ikke) et åpent punkt?

Et åpent punkt er noe som gjenstår i selve produktet eller prosjektet: en manglende test, en kjent bug, konfig som må settes ved deploy, en beslutning som venter, noe brukeren eksplisitt ba deg huske. Git- og prosesstatus er **ikke** åpne punkter — brukeren ser git-status selv, og slike punkter drukner de ekte. (I Resultat-seksjonen kan commit-hash eller «ukommittert» nevnes kort som faktum.) Eksempler på ting som IKKE skal inn i Åpne punkter eller `issues.md`:

- «Ingen av endringene er committet — husk å committe.» / «må pushes»
- Samordningsbeskjeder om repo-tilstand: «NN må `git pull` / re-synke klonene sine»
- Observasjoner om førtilstand: «fil X sto som endret/utracket før økten — avklar før commit»

Unntaket er når tilstanden er reelt kritisk — f.eks. en migrasjon er kjørt mot en delt database mens koden ikke er delt, slik at andre kan rammes.

## issues.md

`.logs/<bruker-slug>/issues.md` er brukerens samlede liste over åpne punkter på tvers av alle sesjoner — det er denne brukeren faktisk sjekker. Opprett fila med overskriften `# Åpne punkter` hvis den mangler. Vedlikehold den hver gang du logger, **før** sesjonsfila committes:

1. **Les lista først**, så du ikke dupliserer et punkt som alt er åpent.
2. **Legg til** hvert nytt åpent punkt fra økten, med dato og lenke til sesjonsfila:
   ```markdown
   - [ ] 2026-08-08 [kurstab-redesign](999-2026-08-08-14-31-07-kurstab-redesign.md) — e2e-test for tastaturnavigasjon gjenstår
   ```
   Ikke legg til noe for `Ingen.`.
3. **Lukk** punkter denne økten løste — også punkter fra tidligere sesjoner. Marker løste punkter med `[x]` og løsningsdato: `- [x] … (løst 2026-08-08)`. Ikke slett linjer — historikken har verdi. Referer til det lukkede punktet i Resultat.

Unntak: sier prosjektets rot-`CLAUDE.md`/`AGENTS.md` eksplisitt at åpne punkter skal føres et annet sted (f.eks. i en egen issue-tracker), følg den instruksen i stedet. Uten slik instruks gjelder alltid `issues.md`.

## Forankring i CLAUDE.md/AGENTS.md

Sjekk ved hver bruk om prosjektets rot-`CLAUDE.md` eller `AGENTS.md` refererer til denne skillen (`sesjonslogg`). Gjør ingen av dem det, **legg referansen inn** — det er den instruksen som sørger for at fremtidige økter i prosjektet faktisk logger; skill-beskrivelsen alene er ingen garanti for trigging.

- Legg regelen der prosjektets agent-instruksjoner faktisk bor: i `AGENTS.md` hvis den finnes (eller hvis `CLAUDE.md` bare er en `@AGENTS.md`-import), ellers i `CLAUDE.md`; finnes ingen av dem, opprett `CLAUDE.md` med regelen.
- Hold den kort og tilpass filens eksisterende struktur og språk, f.eks.:
  > **Logg sesjonen.** Når en oppgave/økt avsluttes — før sluttoppsummeringen — bruk `sesjonslogg`-skillen: den logger Oppgave + Plan + Resultat + åpne punkter per bruker i `.logs/<bruker>/`, fører åpne punkter i `issues.md` og committer loggfilene.
- Ikke dupliser: står referansen alt et sted i en av filene, er alt i orden.

## Ved oppstart av en fortsettelse

Når brukeren refererer til tidligere arbeid («fortsett med …», «hva gjorde vi sist med …»), les den relevante fila i `.logs/` (brukerens egen mappe først, deretter eventuelt andre brukeres) og brukerens `issues.md` **før** du begynner — det er raskere og sikrere enn å rekonstruere fra koden eller hukommelsen.
