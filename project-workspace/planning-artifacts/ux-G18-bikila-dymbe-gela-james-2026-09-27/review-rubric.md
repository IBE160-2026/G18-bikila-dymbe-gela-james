# Spine Pair Review — SnowFinder

Gjennomgått 2026-10-28, etter steg 8c. Grunnlag: `DESIGN.md`, `EXPERIENCE.md`, `.memlog.md`,
`wireframes/*.excalidraw`, PRD (`project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md`),
og for kontroll av påstanden «wireframene viser appen slik den er bygget»: `src/` og
`public/data/demo.json`.

## Overall verdict

**Adequate.** Paret er brukbart som kontrakt: alle fargetokener har hex, DESIGN.md følger den
låste seksjonsrekkefølgen, EXPERIENCE.md har alle standardseksjonene, og de tre wireframene er
gyldige og lenket. Steg 8c har likevel innført fire feil som slår direkte inn i målingene og i neste
bygg: tre av brukertestens oppgaver kan ikke måle det de skal mot demodataene (SM-2, SM-3, SM-4),
og `banner-stale-data` er spesifisert med en tekstfarge som gir 2,9:1 kontrast (Story 1.6 står i
backlog og vil bygge den slik). I tillegg mangler DESIGN.md rader for en rekke komponenter som
EXPERIENCE.md og wireframene bruker, og flere tilstander som appen allerede har, står ikke i
spinen. Rett de fire høye funnene før brukertesten (F4) og før Story 1.6.

## 1. Flow coverage — adequate

UJ-1 → Flyt 1, UJ-2 → Flyt 2 (Ikke i v1, beholdt som historikk), UJ-3 → Flyt 3, FR-30 → Flyt 4.
Alle har navngitt person, nummererte steg og klimaks. SM-2, SM-3 og SM-4 er koblet til oppgavene i
Brukertestplan.

### Findings

- **[medium]** Flyt 1 steg 2 sier «nysnø ≥ 15 mm», men appen, wireframene og brukertestplanen
  bruker cm («Nysnø minst 10 cm», `FilterPanel.tsx` `enhet: 'cm'`). Flyten ble rettet i 8c uten at
  enheten fulgte med (EXPERIENCE.md, Nøkkelflyter, Flyt 1). *Fix:* Skriv «nysnø minst 15 cm» (eller
  et tall som finnes i demodataene) og legg til én setning om at PRD-ens mm er omregnet.
- **[medium]** Feil-grenen i Flyt 1 sier at «banneret foreslår», men null treff er ikke et banner:
  wireframen (Utforsk, ramme 5) og FR-14 viser en tekst med knappen «Bruk forslaget» som setter
  verdien og flytter fokus til glideren. Tilstandsmønstre-raden «Null treff» nevner heller ikke
  knappen (EXPERIENCE.md, Flyt 1 og Tilstandsmønstre). *Fix:* Bytt «banneret» med «teksten over
  kartet», og legg «Bruk forslaget» (ett trykk, fokus til glideren) og «Nullstill» inn i raden.
- **[low]** Flyt 3 (UJ-3) har ingen feil-gren, selv om null treff og en avslått posisjon er
  særlig viktig for en skjermleserbruker (EXPERIENCE.md, Flyt 3). *Fix:* Legg til at null treff
  annonseres via `aria-live` sammen med forslaget, og at «Bruk forslaget» flytter fokus.
- **[low]** Flyt 4 (FR-30) har ingen feil-gren for `npm run data` uten nett eller med under 95 %
  gyldige (EXPERIENCE.md, Flyt 4). *Fix:* Én linje: kjøringen publiserer ikke, demodata og
  demobanneret blir stående.

## 2. Token completeness — adequate

Alle 28 fargetokener har hex. Alle `{…}`-referanser i frontmatter og prosa løses
(`{colors.surface-base|surface-raised|accent|snowscore-0|snowscore-3|warning|surface-sunken|ink-secondary}`,
`{rounded.sm|md|lg|full}`, `{spacing.2|3|4|gutter}`, `{typography.numeric}`,
`{components.map-marker.size|sizeCountryLevel|borderWidth|borderWidthSmall}`). Målt kontrast
(WCAG): ink-primary på warning 2,92:1, hvit på warning 5,93:1; snowscore-0/1/2 med ink-primary
7,07 / 9,02 / 4,98:1; snowscore-3 med hvit 8,65:1; accent på surface-sunken 4,64:1.

### Findings

- **[high]** `Banner-stale-data` er spesifisert med ink-primary-tekst på `{colors.warning}`
  «(ikke hvit — bedre kontrast mot gult/oker)». `#8A5A00` er mørk oker, ikke gul: ink-primary gir
  2,92:1 og stryker på AA (4,5:1), mens hvit gir 5,93:1. Banneret er ikke bygget ennå (Story 1.6 i
  backlog), så neste bygg følger feilen rett inn i en axe-feil (SM-7) (DESIGN.md, Components,
  Banner-stale-data). *Fix:* Bytt til hvit tekst (`{colors.surface-raised}`) og fjern begrunnelsen
  i parentes, eller bytt bakgrunnen til en lys oker-tone som får et eget token.
- **[medium]** Grensene mellom de fire SnowScore-trinnene står ingen steder i spinene. De finnes
  bare i wireframen for forklaringssiden (70 Svært godt, 45 Godt, 20 Middels, 0 Lite) og i koden,
  så en konsument kan ikke koble score til `{colors.snowscore-0..3}` og etikett fra kontrakten
  (DESIGN.md, Colors; EXPERIENCE.md, Komponentmønstre, Score-badge). *Fix:* Legg en tabell med
  terskel → token → etikett → tekstfarge under SnowScore-skalaen i DESIGN.md.Colors.
- **[low]** Ingen eksplisitt kontrasttabell for de bærende kombinasjonene; regelen «velg ≥4.5:1»
  er overlatt til byggeren. snowscore-2 får 3,47:1 med hvit og må ha ink-primary, men det står ikke
  (DESIGN.md, Components, Score-badge). *Fix:* Angi tekstfarge per trinn i tabellen over.
- **[low]** Noen verdier er ikke tokenisert: `{colors.snowscore-0..3}` er ingen gyldig sti, skyggen
  `0 -2px 12px rgba(…)` er hardkodet, valgt markørs «tykkere aksent-kant» mangler bredde, og
  «`surface-sunken`» og «ink-primary» står uten klammer (DESIGN.md, Colors, Elevation & Depth,
  Components). *Fix:* Skriv fulle stier, og legg `selectedBorderWidth` og en `shadow`-verdi i
  frontmatter.

## 3. Component coverage — thin

Komponenter i EXPERIENCE.md: Kartmarkør, Listerad, Score-badge, Filterpanel, Skydekke i dagslys,
Stedstype, Datagrunnlag for nysnø, Hurtigvalg-chip, Beste skivindu-kort, Kalkulator, Demobanner,
Datakvalitetspanel. I DESIGN.md: Score-badge, Kartmarkør, Location-card / listerad, Filter-slider,
Banner-stale-data, Banner-demo, Datakvalitetspanel, Beste skivindu-kort. Brukt i prosa og
wireframer uten rad i noen av filene: toppnavigasjon med ☰-meny, Kart | Liste-vekslingen,
bunn-ark med «Filter»-knapp og krav-chips, «Bruk forslaget», «Nullstill», SnowScore-kortet med
delpoeng, Grunnlag-kortet, «Tilbake», sorteringsvalget.

### Findings

- **[medium]** Bunn-arket og toppnavigasjonen er de mest layoutkritiske delene på mobil, og 8c
  rettet oppførselen deres, men de har ingen komponentrad i noen av filene. Bunn-arket nevnes bare
  i Elevation og Shapes, ☰-menyen bare i IA (DESIGN.md, Components; EXPERIENCE.md,
  Komponentmønstre). *Fix:* Legg til «Bunn-ark» (lukket: «Filter»-knapp + chips; åpent; skygge og
  `{rounded.lg}`) og «Toppnavigasjon» (☰ under 768 px, `aria-current`) i begge tabellene.
- **[medium]** Stedssidens to hovedkort, «SnowScore» med delpoeng (A/B/C «av 60/25/15») og
  «Grunnlag», er beskrevet i IA og Responsive og tegnet i wireframen, men har ingen rad i noen av
  filene (DESIGN.md, Components; EXPERIENCE.md, Komponentmønstre). *Fix:* Legg til rader med
  anatomi og at `display`-rollen brukes på tallet.
- **[medium]** Navnene sprik mellom filene: «Demobanner» ↔ «Banner-demo», «Listerad» ↔
  «Location-card / listerad», «Filterpanel» ↔ «Filter-slider», og «Banner-stale-data» har ingen rad
  i EXPERIENCE.md.Komponentmønstre (bare en tilstand) (begge filer). *Fix:* Bruk samme navn i
  begge, og gi Banner-stale-data en atferdsrad.
- **[low]** Hurtigvalg-chip, Kalkulator, Stedstype, Datagrunnlag for nysnø og Skydekke i dagslys
  har atferd, men ingen visuell rad i DESIGN.md (DESIGN.md, Components). *Fix:* Én samlet rad for
  filterkontroller (avkrysning, radio, chip) og én for kalkulatoren.

## 4. State coverage — thin

Utforsk har lasting, null treff, utdatert, fjernet, gamle data, demo og ufullstendige data.
Stedssiden har ufullstendige data, mørketid, kortere vindu og ingen skivindu. Forklaringssiden har
ugyldig inndata i kalkulatoren.

### Findings

- **[medium]** Feiltilstandene appen allerede har, står ikke i spinen: datafilen lar seg ikke laste
  (`role="alert"`), «Fant ikke stedet», «Fant ikke siden», og alle steder fjernet fordi dataene er
  for gamle (`INGEN_FERSKE`) (EXPERIENCE.md, Tilstandsmønstre; `src/App.tsx`). *Fix:* Legg til én
  rad per tilstand med tekst og flate.
- **[medium]** «Data for gammel (>12 t)» sier at stedet «vises ikke i det hele tatt», men en delt
  lenke `/sted/:id` til et slikt sted viser «Dataene for dette stedet er for gamle til å vises».
  Spinen dekker ikke direkte lenke (EXPERIENCE.md, Tilstandsmønstre). *Fix:* Legg til
  direkte-lenke-tilfellet i raden.
- **[low]** Avslått posisjon (avstandsfilter og avstandssortering) og «Prognosen fra MET mangler
  for dette stedet» har tekst i koden, men ingen rad (EXPERIENCE.md, Tilstandsmønstre). *Fix:* To
  korte rader.
- **[low]** Lasting på stedssiden og forklaringssidens datakvalitetspanel under lasting står ikke
  (raden «Laster» gjelder bare kart/liste) (EXPERIENCE.md, Tilstandsmønstre). *Fix:* Utvid raden
  til alle flater.

## 5. Visual reference coverage — adequate

Filer i `wireframes/`: `wireframe-utforsk-2026-10-28.excalidraw` (304 elementer),
`wireframe-stedsside-2026-10-28.excalidraw` (204), `wireframe-forklaring-2026-10-28.excalidraw`
(211). Alle er gyldig JSON med `type: "excalidraw"`, og alle er lenket fra tabellen i Wireframes
med en konkret liste over rammer. Ingen foreldreløse filer. Kopien i
`project-phase-folders/2-Planleggingsfasen/wireframes/` er identisk, og de relative lenkene løses
fra begge kopiene av EXPERIENCE.md.

### Findings

- **[medium]** IA-seksjonen sier fortsatt «ingen HTML-mockuper generert i denne runden» og har en
  `[NOTE FOR UX: vurder å kjøre nøkkelskjerm-mockuper …]`. Det motsier den nye Wireframes-seksjonen,
  og «spinen vinner» står dermed to steder (EXPERIENCE.md, Informasjonsarkitektur, siste avsnitt).
  *Fix:* Erstatt avsnittet med én lenke til wireframe-utforsk, og la regelen om konflikt stå bare i
  Wireframes.
- **[low]** Wireframene lenkes bare fra én samletabell, ikke inline der de hører hjemme (IA,
  Responsive, Tilstandsmønstre, Beste skivindu-kort), og DESIGN.md (Layout & Spacing) lenker ikke
  til dem i det hele tatt (begge filer). *Fix:* Legg en kort lenke på relevant sted, for eksempel
  «se wireframe-stedsside, ramme 1–2» under Responsive.
- **[low]** Merknaden om kursets skjermkrav i wireframe-stedsside sier at profilen viser «navn,
  type, høyde …», mens spinen nå sier at stedstypen ikke vises (wireframe-stedsside, merknad
  «Kursets skjermkrav: profil»). *Fix:* Fjern «type» fra merknaden.
- **[low]** Wireframene sier at de viser «appen slik den er bygget», men listen i
  wireframe-utforsk har steder og tall som ikke finnes i demodataene (Hemsedal 82 med 18 cm,
  Beitostølen, Geilo), og desktop-kartet har tegnet en tegnforklaring som appen ikke har
  (wireframe-utforsk, ramme 1–2). *Fix:* Merk tallene som illustrasjon, eller bruk demodataene, og
  merk tegnforklaringen tydelig som «finnes ikke, se deferred-work».

## 6. Bloat & overspecification — adequate

Brukertestplanen er ny i 8c og passer ikke i de andre kategoriene, så funnene om den står her.

### Findings

- **[high]** Oppgave 5 (SM-4) måler om deltakeren ser «Utdatert» på Gaustatoppen, men Gaustatoppen
  er ikke utdatert i demodataene (dataalder 0 t mot demo-nå). Det eneste utdaterte stedet er
  Kirkenes (4,0 t). Oppgaven kan ikke oppfylle målet (EXPERIENCE.md, Brukertestplan, oppgave 5).
  *Fix:* Bruk Kirkenes i oppgaven, eller del den i to: prognose (et vilkårlig sted) og dataalder
  (Kirkenes).
- **[high]** Oppgave 3 (SM-3) godtar en forklaring som nevner «nysnø, temperatur eller vind», men
  forklaringssiden sier uttrykkelig at SnowScore ikke måler vind. En deltaker som svarer «på grunn
  av vinden» blir talt som vellykket. Hafjell har dessuten SnowScore 1, så «forklar poengsummen» blir
  å forklare nesten null (EXPERIENCE.md, Brukertestplan, oppgave 3). *Fix:* Krev at svaret nevner
  nysnø/nedbør som snø eller kulde (A, B eller C), og bruk et sted med en midt-score, for eksempel
  Gaustatoppen (58) eller Trysil (50).
- **[high]** Oppgave 1 (SM-2) ber om et skisted med «minst 10 cm nysnø og lite vind». I
  demodataene har bare Trysil minst 10 cm (12,6 cm), og der er vinden 9,5 m/s. «Lite vind» er ikke
  definert, så det er uklart om oppgaven er fullført, og en deltaker som setter vind lavt får null
  treff (EXPERIENCE.md, Brukertestplan, oppgave 1). *Fix:* Gi et konkret krav som demodataene
  oppfyller (for eksempel «minst 10 cm nysnø og vind høyst 10 m/s»), og skriv hvilket sted som er
  riktig svar.
- **[low]** Versjonsmerkene (v2, v3, v4), den struk-ne Flyt 2 og Åpne spørsmål nr. 3, der teksten
  fortsetter med utdatert historikk etter «Løst», gjør det tyngre for en konsument å se hva som
  gjelder nå (EXPERIENCE.md, toppen, Flyt 2, Åpne spørsmål 3). *Fix:* Flytt historikken til
  `.memlog.md` og la Åpne spørsmål 3 slutte etter «Løst».

## 7. Inheritance discipline — adequate

`sources` i EXPERIENCE.md løses (alle fire filene finnes). SM-2, SM-3 og SM-4 er sitert med ID og
riktig terskel (4 av 5, under 2 min for SM-2).

### Findings

- **[medium]** Flytnavnene er ikke ordrett fra PRD-en: «Sena finner et skisted med nok nysnø» (PRD:
  «Sena planlegger helgetur til et skisted med nok nysnø»), «Kelly finner et sted med skjermleser og
  tastatur» (PRD: «Kelly, som bruker skjermleser, finner et sted uten å bruke kartet»), «Aksel
  følger et sted og får varsel» (PRD: «Aksel følger opp et favorittsted uten å sjekke manuelt hver
  dag») (EXPERIENCE.md, Nøkkelflyter). *Fix:* Bruk PRD-titlene ordrett etter «realiserer UJ-n».
- **[low]** Komponentnavnene er ikke identiske i de to filene (se kategori 3). *Fix:* Som i
  kategori 3.
- **[low]** «Kursets skjermkrav» og Brukertestplan sier «Faglærer har ikke bekreftet» om pålogging,
  men dette står ikke som et åpent spørsmål (bare inne i et struket punkt) (EXPERIENCE.md, Kursets
  skjermkrav og Åpne spørsmål). *Fix:* Legg det til som et åpent punkt med eier.

## 8. Shape fit — strong

DESIGN.md følger den låste rekkefølgen (Brand & Style → Colors → Typography → Layout & Spacing →
Elevation & Depth → Shapes → Components → Do's and Don'ts). EXPERIENCE.md har alle standardene
(Foundation, IA, Tone, Komponentmønstre, Tilstandsmønstre, Interaksjonsprimitiver,
Tilgjengelighetsgulv, Nøkkelflyter) og Responsive, som er utløst av mobil + desktop.

### Findings

- **[low]** «Kursets skjermkrav» og «Brukertestplan» er ikke atferdskontrakt for en byggekonsument.
  De har likevel sin plass, fordi PRD §9.3 peker hit for testplanen og kurset krever koblingen
  (EXPERIENCE.md, egne seksjoner). *Fix:* Ingen endring nødvendig. Vurder én setning øverst i
  seksjonene om at de ikke er byggekrav.
- **[low]** Inspiration & Anti-patterns mangler. Brand & Style nevner «norske friluftstjenester»
  som motbilde, men det er tynt grunnlag for å kreve seksjonen (EXPERIENCE.md). *Fix:* Ingen, med
  mindre gruppa vil ta med konkrete referanser.

## Mechanical notes

- Alle tre `.excalidraw`-filene parses som JSON med `type: "excalidraw"` (304, 204 og 211
  elementer).
- `DESIGN.md`, `EXPERIENCE.md` og `wireframes/` er identiske med kopiene i
  `project-phase-folders/2-Planleggingsfasen/`.
- Kontrast regnet med WCAG 2.1-formelen: warning/ink-primary 2,92:1, warning/hvit 5,93:1,
  snowscore-2/hvit 3,47:1, snowscore-2/ink-primary 4,98:1, snowscore-3/hvit 8,65:1.
- Demodata (`public/data/demo.json`, demo-nå 2026-10-07T20:30:29Z): utdatert = Kirkenes (4,0 t),
  ufullstendig = Trondheim, skisted med minst 10 cm nysnø = bare Trysil (12,6 cm, vind 9,5 m/s),
  Hafjell SnowScore 1, Gaustatoppen 58 (alder 0 t).
- `banner-stale-data` er ikke bygget (Story 1.6 i `backlog`), så kontrastfeilen er ennå ikke i
  koden.
- Tellinger: critical 0, high 4, medium 10, low 15.
