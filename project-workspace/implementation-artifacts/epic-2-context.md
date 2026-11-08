# Epic 2 Context: Forstå og stole på SnowScore

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Brukeren skal kunne åpne forklaringssiden «Slik beregner vi SnowScore» og forstå nøyaktig hva tallet måler og hvordan det regnes ut. Siden har kort fortalt, steg for steg med formelen, et utledet regneeksempel, datakilder og begrensninger, kvaliteten på siste kjøring, en kalkulator (Bør ha) og en endringslogg. Den gjør SnowScore etterprøvbar og ærlig og nås fra hver SnowScore-visning, uansett om brukeren kom fra kartet, listen eller stedssiden. Suksessmålet er at minst 4 av 5 testbrukere kan forklare en vist SnowScore med delpoengene etter å ha lest siden. Alle stories i epicen er ferdige. Det nye arbeidet er steg 3 i UX-forbedringen (2026-11-07): delpoengstolper på SnowScore-kortet, i regneeksemplet og i kalkulatoren.

## Stories

- Story 2.1: Les kort fortalt og steg for steg
- Story 2.1b: Logo, én forklaringslenke og slidere som starter til venstre (Bør ha)
- Story 2.2: Se det utledede regneeksempelet
- Story 2.3: Les om datakilder og begrensninger
- Story 2.4: Prøv SnowScore-kalkulatoren selv (Bør ha)
- Story 2.5: Delpoengstolper i SnowScore-kortet, regneeksemplet og kalkulatoren (Bør ha, ny 2026-11-08)

## Requirements & Constraints

- **Kort fortalt og steg for steg:** Siden sier hva SnowScore måler og ikke måler (ikke vind), viser formelen og har én illustrasjon per delpoeng: A Nysnøpotensial, B Kuldebonus og C Snøandel.
- **Endringslogg:** Versjonsnummer og begrunnelse for hver formelendring. Første rad er nevneren i B, endret fra 6 til 16.
- **Lenket fra hver score:** Toppnavigasjonen, kart, liste og stedssiden lenker til siden. På Utforsk vises lenken én gang: i toppnavigasjonen fra 768 px, og ved Kart/Liste under 768 px.
- **Regneeksempel:** 6-timerstabellen fra briefen, med S, P og T̄ utledet før A, B, C og summen. En test kjører eksempelets inndata gjennom den delte SnowScore-modulen, så tekst og modul ikke kan sprike.
- **Datakilder og begrensninger:** MET (CC BY 4.0) og NVE (NLOD) med lisens. SnowScore er en prognose og ikke en garanti, og SnowFinder er ikke en skredfarevurdering. Siden lenker til Varsom.no for fjellområder.
- **Datakvalitet:** Siste publiserte kjørings rapport i klartekst: tidspunkt, antall steder, andel gyldige, avviste svar per kilde og antall med ufullstendige data. Panelet må virke i demomodus.
- **Kalkulator:** Nedbør og temperatur kan endres, og A, B, C og summen oppdateres umiddelbart. Komponenten har aldri en egen kopi av formelen.
- **Delpoengstolper (2026-11-07):** Hvert delpoeng har en vannrett stolpe fylt mot delpoengets eget maks (60, 25 og 15), så en full stolpe betyr fullt hus på det delpoenget. Det gjelder SnowScore-kortet på stedssiden, delpoengene i regneeksemplet og kalkulatoren. Ved ufullstendige data, og ved ugyldig inndata i kalkulatoren, vises verken delpoeng eller stolper.
- **Tilgjengelighet:** Axe/Playwright-testen av forklaringssiden og stedssiden skal fortsatt gi null brudd på WCAG 2.1 AA. Stolpene er `aria-hidden`, og teksten «x av N» bærer tallet, så skjermleseren hører det samme som før. Ingen informasjon formidles bare med farge.
- **Ingen ny infrastruktur:** Siden er statisk, leser bare datafila og sender ingenting. Ingen nye avhengigheter for stolpene; de er ren HTML og CSS.

## Technical Decisions

- **Én formel:** Alle tall og parametere kommer fra `shared/snowscore.ts` (via `src/lib/snowscore.ts`), også maks-verdiene stolpene fylles mot (`SNOWSCORE.maxA/maxB/maxC`). Skriv aldri 60/25/15 for hånd. Delpoengene er uavrundede i modulen, og bare totalen avrundes. Stolpens bredde regnes fra den uavrundede verdien delt på maks, avgrenset til 0–100 %.
- **Formelendringer** er planendringer: de går gjennom `bmad-correct-course` og gir en ny rad i endringsloggen og ny `SNOWSCORE_VERSION`.
- **Ett datalag:** Bare datakvalitetspanelet trenger datafila, og den leses via `useSteder()`. Forklaringsteksten, regneeksemplet og kalkulatoren venter ikke på data.
- **Tokens har ett kildested:** `src/lib/theme.ts` og `src/styles/tokens.css`, holdt i sync av `theme.test.ts`. Stolpen bruker bare eksisterende tokens (`spacing.2`, `rounded.full`, `surface-sunken`, `ink-secondary`) og trenger ingen nye farger.
- **Gjenbruk:** Én felles stolpekomponent eller klasse for alle tre flatene, så de ser like ut og ikke kopieres.
- **Tester:** Enhetstester ved siden av koden og E2E med axe i `tests/e2e/` (`forklaring.spec.ts`, `sted.spec.ts`). Test at fyllet følger delpoeng/maks, og at stolpene mangler ved ufullstendige data og ugyldig inndata.

## UX & Interaction Patterns

- **Rekkefølge på siden:** Kort fortalt, Steg for steg, Regneeksempel, Datakilder og begrensninger, Datakvalitet, Prøv selv og Endringslogg.
- **Delpoengstolpe:** En `spacing.2` høy, avrundet skinne i `surface-sunken` med fylt del i `ink-secondary`, plassert mellom etiketten og verdien («30 av 60»). Den er nøytral grå med vilje: SnowScore-skalaen og aksentblått brukes ikke, så score-badgen er fortsatt det eneste blå på kortet. Under 375 px kan stolpen bli smal, men den skal aldri skyve verdien ut av raden. Mørk modus bruker `-dark`-variantene.
- **SnowScore-kortet:** Overskriften «SnowScore», score-badge med tallet i `display`, delpoengene som etikett, stolpe og «x av N» i `numeric`, med hårstrek mellom radene og lenken «Slik beregner vi SnowScore» nederst. Ingen begrunnelse per rad, fordi Grunnlag-kortet har rådataene.
- **Regneeksempel:** Delpoengene under «Delpoengene» får de samme stolpene, så brukeren kjenner dem igjen på stedssiden.
- **Kalkulator:** To felt, «Nedbør i 24 timer (mm)» og «Snittemperatur (°C)», side om side fra 768 px. Stolpene følger tallene mens brukeren skriver. Ugyldig felt får tykkere `danger`-kant og en feilmelding rett under, koblet med `aria-describedby`.
- **Datakvalitet:** Et `surface-raised`-kort uten SnowScore-farger, og avviste svar vises som tall, ikke i rødt. Under lasting står «Henter kvalitetsrapporten for siste kjøring …», og ved feil «Kvalitetsrapporten kunne ikke lastes. Last inn siden på nytt for å prøve igjen.» Resten av siden vises uansett.
- **Mikrotekst:** Rolig og presis, lover aldri snø. Skriv for eksempel «Siste kjøring: 297 av 300 steder gyldige, kl. 14:05», ikke «Datakvalitet: OK».
- **Tilgjengelighetsgulv:** Fokusring i `accent`, trykkmål minst 44 px, kontrast minst 4,5:1, illustrasjonene har tekstalternativ, og det er ett brytpunkt ved 768 px.

## Cross-Story Dependencies

- SnowScore-kortet ligger på stedssiden fra Story 1.9 (Epic 1), men stolpene der hører sammen med regneeksemplet (2.2) og kalkulatoren (2.4) og bør bygges i samme endring, så de tre flatene er like.
- 2.2 og 2.4 bygger på SnowScore-modulen fra 1.4 og kan ikke endre formelen.
- 2.3 leser kvalitetsrapporten fra datafila fra 1.5 og 1.10, både i demo- og normalmodus.
- Epic 3 endrer layouten i Utforsk. Forklaringslenken ved Kart/Liste under 768 px (2.1b) må overleve det.
- Utsatte funn i `deferred-work.md` om forklaringssiden (lesbar tekst for formlene, felles axe-hjelper og utdaterte steder i datakvalitetspanelet) bør leses før arbeid i samme område.
