# 2026-09-27: Bygg SnowFinder — planleggingskjeden (Mary → John → Sally → Winston → John)

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Sonnet 5), BMAD-agentene Mary (bmad-agent-analyst), John
(bmad-agent-pm), Sally (bmad-agent-ux-designer), Winston (bmad-agent-architect), i én
sammenhengende agent-kjede
**Fase:** Planlegging (steg 3–7 i fremdriftsplanen)
**Resultat:** Rettet produktbrief, [PRD](../../project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md),
[DESIGN.md](../../project-phase-folders/2-Planleggingsfasen/SnowFinder-DESIGN.md) +
[EXPERIENCE.md](../../project-phase-folders/2-Planleggingsfasen/SnowFinder-EXPERIENCE.md),
oppdatert [arkitektur](../../project-phase-folders/2-Planleggingsfasen/SnowFinder-Arkitektur.md),
[epics og stories](../../project-phase-folders/2-Planleggingsfasen/SnowFinder-Epics-og-Stories.md).
Fire PR-er (#1–#4) + denne økten sin PR åpnet på egne, stablede branches.

## Prompter

### 1
> Bygg SnowFinder som en fungerende nettside med produktbriefen som styrende grunnlag. Les hele
> briefen og eventuelle vurderingskriterier for IBE160 før du starter. Målet vårt er en
> besvarelse på A-nivå [...] Bruk agentene Mary, John, Winston, Sally, James og Murat i rollene
> de er definert med i prosjektet. La dem vurdere produktbriefen fra sine fagområder og
> samordne forslagene til én realistisk plan. [...] Før du koder: vis en kort plan [...] Still
> spørsmål dersom produktbriefen eller vurderingskriteriene er uklare.

**Svar (kort):** Undersøkte repoet (fremdriftsplan, CONTRIBUTING.md, arkitektur) og fant: ingen
IBE160-vurderingskriterier i repoet, ingen Supabase/hosting satt opp, og at gruppas egen
`CONTRIBUTING.md` krever branch+PR for alt (ikke direkte commits til `main`). Stilte tre
avklaringsspørsmål (kriterier, git-arbeidsflyt, eksterne tjenester) via strukturert spørsmål.
**Hva vi gjorde med det:** Brukt som grunnlag for hele den videre kjeden.

### 2
> vi trenger råd fra de erfarne agenter i bmad for et realistikk prosjekt [...] Bygg og test
> lokalt, dokumenter oppsett for dere (anbefalt)

**Svar (kort):** Tolket som: la BMAD-agentene selv gi faglig råd på kriterier/arbeidsflyt
fremfor at Joseph bestemmer det direkte; bygg/test lokalt og dokumenter ekstern
oppkobling som eget steg senere.
**Hva vi gjorde med det:** Startet agent-kjeden med Mary først (fremdriftsplanens eget neste
steg), i stedet for å oppfinne et annet startpunkt.

### 3
> (Mary-invokasjon) Gjennomgå briefen [...] adresser konkret hvert av disse punktene som ble
> notert 2026-09-26 men ikke rettet ennå [SnowScore-formel, regneeksempel, mørketid, mm/cm,
> målbarhet, WCAG, scope-realisme, overskriftsspråk, skrivefeil]

**Svar (kort):** Mary rettet: B (kuldebonus) nullstilt uten nedbør + nevner 6→16 for bedre
spredning; regneeksempel byttet til eksplisitt 6-timers tabell; mm/cm-forhold presisert;
mørketid-fallback lagt til; "Nytte"-kriteriet gjort målbart; WCAG presisert (kartlag unntatt, ny
tilgjengelig listevisning lagt til Må ha); QA-liste delt i må ha-minimum/bør ha-dybde.
Overskriftsspråk vurdert og bevisst latt stå.
**Hva vi gjorde med det:** Alle 7 endringer brukt, committet på egen branch
(`planlegging/mary-retter-briefen`), PR #1 åpnet.

### 4
> (John/PRD-invokasjon) Opprett PRD [...] Skriv PRD-en i prosjektets egen mappestruktur [...]

**Svar (kort):** John skrev PRD med 29 FR-er, 9 NFR-er, 3 brukerreiser (inkl. en egen for
skjermleser/tastatur mot listevisningen), MVP-omfang speilet fra MoSCoW, 8 suksessmål inkl. 2
mot-metrikker. Fast-path (agent-kjede), antagelser eksplisitt merket.
**Hva vi gjorde med det:** Brukt, committet på `planlegging/john-prd`, PR #2 (stacket på #1).

### 5
> (Sally/UX-invokasjon) Lag DESIGN.md og EXPERIENCE.md [...]

**Svar (kort):** Sally leverte design-tokens (egen 4-trinns SnowScore-fargeskala adskilt fra
UI-aksent), komponentmønstre, fullt tilstandskart, tilgjengelighetsgulv og tre navngitte
nøkkelflyter. Ingen HTML-mockuper generert (flagget som åpent spørsmål).
**Hva vi gjorde med det:** Brukt, committet på `planlegging/sally-ux`, PR #3 (stacket på #2).

### 6
> (Winston/arkitektur-invokasjon) Oppdater (ikke skriv på nytt) arkitekturen mot PRD og UX [...]

**Svar (kort):** Winston la til AD-8 (kart/liste er én rute/ett datalag) og AD-9 (design-tokens
har ett kildested i kode, `theme.test.ts` fanger drift), utvidet AD-2 med et eksplisitt
mørketid-flagg. AD-1–AD-7 videreført uendret med stabile ID-er.
**Hva vi gjorde med det:** Brukt, committet på `planlegging/winston-arkitektur-v2`, PR #4
(stacket på #3).

### 7
> kjør neste steg (x3, gjentatt etter hver PR-oppsummering)

**Svar (kort):** Tolket konsekvent som "fortsett til neste fremdriftsplan-steg uten å stoppe for
bekreftelse mellom fasene", men fortsatt med commit+push+PR og en kort statusoppdatering etter
hver fase.
**Hva vi gjorde med det:** Drev kjeden Mary→John→Sally→Winston→John videre uten unødvendige stopp.

### 8
> (John/epics-og-stories-invokasjon, `bmad-create-epics-and-stories`) [...]

**Svar (kort):** Dette skillet er et strengt steg-fil-verktøy som krever eksplisitt
brukergodkjenning ved hvert steg (krav-ekstraksjon, epic-struktur, stories). Presenterte
kravutdrag og epic-struktur (5 epics organisert etter brukerverdi, ikke tekniske lag — bevisst
IKKE en egen "backend"-epic, slik verktøyets egne retningslinjer advarer mot) og stoppet reelt
for godkjenning, i stedet for å anta et "ja" på brukers vegne.
**Hva vi gjorde med det:** Joseph bekreftet krav-ekstraksjonen og godkjente epic-strukturen i to
separate meldinger.

### 9
> jeg bekrefter / Ja

**Svar (kort):** Fortsatte til story-generering: 23 stories skrevet i ett batch (ikke
enkeltvis-godkjenning per story, som verktøyet ellers legger opp til) med Given/When/Then
hentet fra PRD-ens FR-konsekvenser.
**Hva vi gjorde med det:** Presenterte hele settet samlet med meny [A]/[P]/[C].

### 10
> A

**Svar (kort):** Kjørte `bmad-advanced-elicitation`. Bruker valgte metoden "Critique and
Refine" fra et 4-alternativs menyvalg. Fant 6 reelle svakheter: Story 1.4 overdimensjonert (delt
SnowScore-modul + pipeline-integrasjon i én story), manglende story for design-token-scaffolding
(AD-9), manglende frontend-story for stale-data-banneret, ingen test av responsiv
bunn-ark/sidepanel-layout, ingen story for PWA-installerbarhet (forutsetning for push på
iPhone), og at kun én side hadde en eksplisitt automatisert tilgjengelighetstest selv om
WCAG-kravet gjelder bredt.
**Hva vi gjorde med det:** Presenterte funnene og ba om Bruk/Avvis/annen retning.

### 11
> ja

**Svar (kort):** Alle 7 rettelser brukt (inkl. det valgfrie punktet om å dele opp
sol/avstand/stedstype-filterstoryen for bedre parallellisering blant 4 gruppemedlemmer). Epic 1
gikk fra 8 til 9 stories, Epic 3 fra 6 til 8, Epic 4 fikk en ny Story 4.1 (PWA) og ble
renummerert. 27 stories totalt.
**Hva vi gjorde med det:** Dokumentet oppdatert i `project-phase-folders/2-Planleggingsfasen/SnowFinder-Epics-og-Stories.md`,
klar for videre steg (validering) eller pause.

### 12
> push og commit nå, før opp logg for sesjonen under prompter som er under ai logg

**Svar (kort):** Committer epics/stories-arbeidet på egen branch (`planlegging/john-epics-stories`,
stacket på Winston sin PR #4), pusher, åpner PR, og skriver denne loggfilen.
**Hva vi gjorde med det:** Se commit-historikk og PR-lenke i `logg.md`-raden for 2026-09-27.
