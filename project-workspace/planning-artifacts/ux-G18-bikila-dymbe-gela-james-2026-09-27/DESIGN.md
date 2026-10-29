---
name: SnowFinder
description: Norsk snø-utforsker. Kald, klar, tillitsbyggende — tallet skal aldri virke gjettet. Lys som standard (utendørs, blendingsutsatt bruk), mørk modus er «Ikke i v1» (tokenene står klare).
colors:
  surface-base: '#F5F8FB'
  surface-raised: '#FFFFFF'
  surface-sunken: '#EBF1F7'
  ink-primary: '#0F1B2D'
  ink-secondary: '#4A5A70'
  ink-disabled: '#9AA7B8'
  border-hairline: '#DCE5EE'
  accent: '#0B6FB8'
  accent-pressed: '#095A96'
  danger: '#B3261E'
  success: '#1E7A4C'
  warning: '#8A5A00'
  surface-base-dark: '#0B1220'
  surface-raised-dark: '#141B2C'
  surface-sunken-dark: '#0E1626'
  ink-primary-dark: '#E8EEF5'
  ink-secondary-dark: '#9FB0C4'
  ink-disabled-dark: '#5A6B80'
  border-hairline-dark: '#232E42'
  accent-dark: '#5FAEEA'
  accent-pressed-dark: '#8AC6F0'
  danger-dark: '#E5847D'
  success-dark: '#5FCB92'
  warning-dark: '#D9A441'
  snowscore-0: '#9AA7B8'
  snowscore-1: '#8FC1E8'
  snowscore-2: '#3E8FD0'
  snowscore-3: '#0B4C8C'
typography:
  display:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: '2.25rem'
    fontWeight: '700'
    lineHeight: '1.15'
  heading:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: '1.25rem'
    fontWeight: '600'
    lineHeight: '1.3'
  body:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: '400'
    lineHeight: '1.5'
  meta:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: '0.8125rem'
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '0.01em'
  numeric:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: '600'
    fontFeatureSettings: "'tnum' 1"
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  '7': 48px
  gutter: 16px
components:
  score-badge:
    radius: '{rounded.full}'
    padding: '{spacing.2} {spacing.3}'
    font: '{typography.numeric}'
    borderWidth: '2px'
  location-card:
    radius: '{rounded.md}'
    background: '{colors.surface-raised}'
    padding: '{spacing.4}'
    gap: '{spacing.2}'
  filter-slider:
    radius: '{rounded.full}'
    trackHeight: '4px'
    thumbSize: '24px'
    accent: '{colors.accent}'
  map-marker:
    size: '28px'
    sizeCountryLevel: '10px'
    radius: '{rounded.full}'
    borderWidth: '2px'
    borderWidthSmall: '1px'
    borderColor: '{colors.surface-raised}'
  bottom-sheet:
    radius: '{rounded.lg}'
    background: '{colors.surface-raised}'
    shadow: '0 -2px 12px rgba(15,27,45,0.08)'
  banner-stale-data:
    radius: '{rounded.sm}'
    background: '{colors.warning}'
    textColor: '{colors.surface-raised}'
    padding: '{spacing.3} {spacing.4}'
  banner-demo:
    radius: '{rounded.sm}'
    background: '{colors.surface-sunken}'
    borderColor: '{colors.ink-secondary}'
    borderWidth: '1px'
    padding: '{spacing.3} {spacing.4}'
---

## Brand & Style

SnowFinder er et måleinstrument, ikke en livsstilsapp. Den estetiske holdningen er
værstasjonens, ikke reisebloggens: rolige, kalde flater, ett tall som betyr noe (SnowScore), og
ingen visuell støy som konkurrerer med det tallet. Der mange norske friluftstjenester bruker
varme, «koselige» toner og store heltebilder, holder SnowFinder seg til data og klarhet — kaldt
blått og nøytralt grått, én tydelig aksentfarge for handling, og typografi som er lett å lese med
solbriller på en fjelltopp eller på en frostet mobilskjerm i bilen.

Lys modus er standard, fordi mesteparten av bruken skjer utendørs eller i sterkt dagslys der en
mørk flate blender mindre men er vanskeligere å lese i sollys. Mørk modus er «Ikke i v1»
(2026-10-09, revisjonen): den krever egne kontrastsjekker og axe-tester i begge moduser.
`-dark`-tokenene står klare for en senere versjon. `[ASSUMPTION: lys som standard, ikke mørk — brief nevner begge
bruksmønstre («rett før en tur» og planlegging kvelden før); dette kan snus hvis gruppa er uenig.]`

## Colors

- **Snø-hvit (`{colors.surface-base}`)** er hovedflaten — en kald, nesten umerkelig blåtone, ikke
  et klinisk rent hvitt. Brukes på all bakgrunn utenom kort og paneler.
- **Ren hvit (`{colors.surface-raised}`)** løfter kort, paneler og modaler synlig fra
  bakgrunnen uten skygge (se Elevation).
- **Dyp blå (`{colors.accent}`)** er den eneste kromatiske handlingsfargen: primærknapper,
  lenker, aktiv filterverdi, fokusring. Brukes aldri dekorativt.
- **SnowScore-skalaen** (`{colors.snowscore-0}` → `{colors.snowscore-3}`, grå → sterkt blått, 4
  trinn) er *forbeholdt* SnowScore selv — kartmarkører, score-merker, listerad-indikatorer.
  Brukes aldri til noe annet (ikke til generisk status, ikke til kategori-tagger), slik at
  brukeren lærer seg at «denne fargeskalaen betyr snøpotensial» og ingenting annet. Trinnene,
  etikettene og tekstfargen står i tabellen under (tersklene vedtatt av gruppa 2026-10-08, samme
  verdier som i koden):

  | SnowScore | Token | Etikett | Tekstfarge | Kontrast |
  |---|---|---|---|---|
  | 70–100 | `{colors.snowscore-3}` | Svært godt | `{colors.surface-raised}` (hvit) | 8,65:1 |
  | 45–69 | `{colors.snowscore-2}` | Godt | `{colors.ink-primary}` | 4,98:1 (hvit gir bare 3,47:1) |
  | 20–44 | `{colors.snowscore-1}` | Middels | `{colors.ink-primary}` | 9,02:1 |
  | 0–19 | `{colors.snowscore-0}` | Lite | `{colors.ink-primary}` | 7,07:1 |
  | Ufullstendige data | ingen | Ufullstendige data | `{colors.ink-secondary}` som ren tekst, ingen badge | – |
- **Danger/Warning/Success** er strengt semantiske og aldri dekorative: danger til feil og
  utdaterte/fjernede data, warning til «siste kjente data» når dataene er eldre enn normalt
  (alltid med hvit tekst, 5,93:1; `{colors.ink-primary}` på warning gir bare 2,92:1),
  success til bekreftelser. *(v2: snøvarsel og tilbakemelding er Ikke i v1, så success har
  ingen fast bruk ennå; tokenet beholdes.)*
- Unngå: å bruke SnowScore-skalaens blåtoner til noe som ikke er en SnowScore (ville lære
  brukeren feil mønster), og å bruke danger-rødt til noe som bare er informativt.

## Typography

`Inter` (eller `system-ui` som fallback — ingen ekstern fontlasting kreves, holder
tid-til-interaktivt lavt, jf. PRD NFR-2). Tabellignende tall (`fontFeatureSettings: 'tnum'`) på
`numeric`-rollen, slik at SnowScore, temperatur og vindverdier alltid får samme tegnbredde og
aldri «hopper» når verdier oppdateres live.

- `display` — kun for SnowScore-tallet på stedssiden. Ett sted i grensesnittet, bevisst.
- `heading` — sidetitler, kortoverskrifter (stedsnavn, seksjonstitler på forklaringssiden).
- `body` — brødtekst, skjemaetiketter, listerad-innhold.
- `meta` — tidsstempler, datakildeattribusjon, hjelpetekst under felt.
- `numeric` — alle tall som sammenlignes eller endres live: score, mm, m/s, °C, %.

## Layout & Spacing

Skala 4/8/12/16/24/32/48px. `{spacing.gutter}` (16px) er fast sidemarg på mobil; desktop bruker
et sentrert innhold med maks bredde og samme 16px indre gutter i kolonner. Filterpanelet er et
fast venstre sidepanel (18rem) på desktop med kartet/listen i resten av bredden, og på mobil et
bunn-ark som åpnes med knappen «Filter» (rettet 2026-10-28 etter appen) — se Responsive & Platform i
EXPERIENCE.md for full oppførsel.

Komposisjonen er tegnet i wireframene:
[wireframe-utforsk](wireframes/wireframe-utforsk-2026-10-28.excalidraw) (sidepanel og bunn-ark),
[wireframe-stedsside](wireframes/wireframe-stedsside-2026-10-28.excalidraw) (én kolonne under
768 px, to fra 768 px) og
[wireframe-forklaring](wireframes/wireframe-forklaring-2026-10-28.excalidraw). Ved konflikt vinner
dette dokumentet og EXPERIENCE.md.

## Elevation & Depth

Ingen tunge skygger. SnowFinder er en flat, kartografisk flate — dybde kommer av tone
(`{colors.surface-base}` → `{colors.surface-raised}` → `{colors.surface-sunken}`), ikke skygge.
Ett unntak: bunn-arket (filterpanel på mobil) og eventuelle modaler får en svak, kort skygge
(`{components.bottom-sheet.shadow}`, `{colors.ink-primary}` med 8 % dekkevne) utelukkende for å
signalisere at de flyter over kartet — aldri på kort i selve listen.

## Shapes

`{rounded.sm}` (6px) på input-felt og slidere. `{rounded.md}` (10px) på kort (stedskort,
listerader, forklaringsblokker). `{rounded.lg}` (16px) på store paneler (bunn-ark, modaler).
`{rounded.full}` utelukkende på score-merket og kartmarkører — sirkelen er reservert for
SnowScore-visning, slik at en bruker lærer «rundt = poengsum».

## Components

Navnene er de samme som i Komponentmønstre i EXPERIENCE.md, som beskriver atferden.

- **Toppnavigasjon** — `{colors.surface-raised}` flate med en `{colors.border-hairline}`-strek
  under. «SnowFinder» står i `heading` og `{colors.ink-primary}`, «Slik beregner vi SnowScore» i
  `{colors.accent}`. Gjeldende side vises med `heading`-vekt og understrek, ikke bare farge. Under
  768 px ligger lenken bak knappen ☰, minst `{spacing.7}` × `{spacing.7}`, med
  `{colors.border-hairline}`-kant og `{rounded.sm}`.
- **Kart | Liste-veksling** — To lenker, minst `{spacing.7}` høye, med `{rounded.sm}`. Den valgte
  har `{colors.accent}` som bakgrunn og `{colors.surface-raised}` som tekst. Den andre har
  `{colors.surface-raised}` bakgrunn, `{colors.border-hairline}`-kant og `{colors.accent}` tekst.
- **Score-badge** — Sirkulær/pill-formet merke. Bakgrunn = riktig SnowScore-trinn
  (`{colors.snowscore-0}` til `{colors.snowscore-3}`), tekstfarge per trinn etter tabellen under
  Colors: `{colors.ink-primary}` på trinn 0–2 og `{colors.surface-raised}` (hvit) på trinn 3.
  Viser **alltid** tallet og en kort tekstetikett («82 · Svært godt»), aldri bare farge
  (WCAG-krav, se Tilgjengelighetsgulv i EXPERIENCE.md).
- **Kartmarkør** — Sirkel, farget etter SnowScore-trinn, hvit kant for kontrast mot alle
  bakgrunnskart-tiles. Valgt sted får en tykkere aksent-kant (`{colors.accent}`). *(Ikke bygget:
  et trykk åpner stedssiden, så kartet har ingen valgt-tilstand, og bredden er ikke fastsatt.)*
  - *(v3, 2026-10-08, Story 1.7b)* Størrelsen følger zoomen:
    - `{components.map-marker.sizeCountryLevel}` ved zoom 5 og lavere;
    - lineær vekst opp til `{components.map-marker.size}` ved zoom 8 og tettere.
  - Kanten er `{components.map-marker.borderWidthSmall}` under 16 px og ellers
    `{components.map-marker.borderWidth}`, så trinnfargen synes på små markører.
  - Steder med ufullstendige data har hvit fyll og alltid 2 px stiplet grå kant
    (`{colors.snowscore-0}`), så de aldri leses som score 0.
  - Grunnen er at 300 steder med 28 px dekket hverandre på landsnivå (manuell sjekk 2026-10-08).
- **Listerad** — `{colors.surface-raised}` kort (`{components.location-card}`) med stedsnavn
  (`heading`), score-badge, og tre nøkkeltall (nysnø/vind/temp) i `numeric`. Hele raden er
  lenken; kanten blir `{colors.accent}` ved hover.
- **Sorteringsvalg** — Etiketten «Sorter etter» og en ordinær `<select>`, minst `{spacing.7}` høy,
  med `{colors.ink-secondary}`-kant, `{rounded.sm}` og `{colors.surface-raised}` bakgrunn.
  Statusteksten under (for eksempel avslått posisjon) står i `meta` og `{colors.ink-secondary}`.
- **Filterpanel** — Glidere med tynt spor (`{components.filter-slider.trackHeight}`) og stort
  gripepunkt (`{components.filter-slider.thumbSize}`, langt over 44px trykkmål med padding),
  aksentfarget fylt del. Levende tallverdi vises alltid ved siden av sliderens gripepunkt, ikke
  bare i et hjørne. Fra 768 px er panelet et `{colors.surface-raised}` kort med `{rounded.md}` i
  venstre kolonne, uten skygge.
- **Filterkontroller** — Stedstype (avkrysning), Datagrunnlag for nysnø (radio), Hurtigvalg-chip og
  chipsene for aktive krav:
  - Avkrysning og radio er `{spacing.5}` store, farget med `{colors.accent}`, og hele etiketten er
    trykkmålet, `{spacing.7}` høy. Gruppen har en overskrift som en glider.
  - Hurtigvalg-chip («Pudderdag», «Sol etter snøfall») er en knapp i full bredde, minst
    `{spacing.7}` høy, med `{colors.accent}`-kant, `{rounded.sm}` og beskrivelsen under i `meta`.
    Aktiv chip er fylt med `{colors.accent}` og har `{colors.surface-raised}` tekst.
  - Chipsene for aktive krav på det lukkede bunn-arket er ren tekst i `meta` med
    `{colors.accent}`-kant og `{rounded.sm}`, ikke knapper. Sirkelen er forbeholdt SnowScore.
  - «Filter», «Nullstill» og «Bruk forslaget» er knapper, minst `{spacing.7}` høye, med
    `{colors.accent}`-kant og `{rounded.sm}`. «Bruk forslaget» og åpen «Filter» er fylt med
    `{colors.accent}`; «Nullstill» er bare kantet.
- **Bunn-ark** — Filterpanelet under 768 px. `{components.bottom-sheet.background}` flate med
  `{components.bottom-sheet.radius}` på de to øvre hjørnene og skyggen
  `{components.bottom-sheet.shadow}`, den eneste skyggen i appen (se Elevation & Depth). Lukket:
  én linje med «Filter», antall treff i `numeric`, chips for aktive krav og «Nullstill». Åpent:
  hele filterpanelet, høyst 60 % av skjermhøyden, med en kort inn-animasjon som droppes ved
  `prefers-reduced-motion`.
- **SnowScore-kortet** — `{colors.surface-raised}` kort (`{rounded.md}`, `{colors.border-hairline}`
  -kant, `{spacing.4}` padding) med overskriften «SnowScore» i `heading`. Score-badgen bruker
  `display`-rollen på tallet, det eneste stedet `display` brukes på en score. Delpoengene A, B og C
  står som etikett og verdi («30 av 60») med `{colors.border-hairline}`-strek mellom radene og
  verdien i `numeric`.
- **Grunnlag-kortet** — Samme kort som SnowScore-kortet, med overskriften «Grunnlag» i `heading`
  og rådataene som etikett og verdi i `numeric`. Kilde og tidspunkt står nederst i `meta` og
  `{colors.ink-secondary}`.
- **«Tilbake»** — En vanlig lenke i `{colors.accent}` nederst på stedssiden, minst `{spacing.7}` ×
  `{spacing.7}` som trykkmål.
- **Banner-stale-data** — Full bredde, `{colors.warning}` bakgrunn og hvit tekst
  (`{components.banner-stale-data.textColor}` = `{colors.surface-raised}`, 5,93:1). Vises når de
  nyeste dataene er eldre enn normalt (over 90 min), for eksempel fordi en datakilde er nede.
  *(Ikke bygget ennå, Story 1.6.)*
- **Demobanner** *(v2)* — Full bredde, `{colors.surface-sunken}` bakgrunn med tynn
  `{colors.ink-secondary}`-kant og `{colors.ink-primary}` tekst: «Demodata – ikke ekte prognoser».
  Bevisst nøytral og ikke warning-farget, så den ikke forveksles med banneret for gamle data.
  Tokenene står under `{components.banner-demo}`.
  `[ASSUMPTION: fargevalget er ikke bestemt av gruppa — nøytrale, eksisterende tokens valgt for å
  unngå nye farger; kan endres.]`
- **Datakvalitetspanel** *(v2)* — `{colors.surface-raised}` kort på forklaringssiden med
  tallene i `numeric`. Bruker ikke SnowScore-skalaen; avviste svar vises som tall, ikke i
  danger-rødt.
- **Kalkulator («prøv selv»)** — To felt, «Nedbør i 24 timer (mm)» og «Snittemperatur (°C)», side
  om side fra 768 px og under hverandre ellers. Feltene er minst `{spacing.7}` høye, med
  `{colors.ink-secondary}`-kant og `{rounded.sm}`. Ugyldig felt får `{colors.danger}`-kant som er
  tykkere (ikke bare farge), og feilmeldingen står rett under i `{colors.danger}`. Resultatet står
  i et `{colors.surface-raised}` kort med delpoengene i `numeric` og summen som score-badge.
- **Beste skivindu-kort** — `{colors.surface-sunken}` bakgrunn (skiller det visuelt fra
  rådata-kortene rundt), tidsromtekst i `heading` («fredag 13–17»), begrunnelse («Snittvind 1 m/s,
  skydekke 91 %, etter snøfallet») og eventuelle forbehold (kortere vindu, mørketid) i `meta`.
  *(Bygget i Story 4.2.)*

## Do's and Don'ts

| Do | Don't |
|---|---|
| Bruk SnowScore-skalaen kun til SnowScore | Gjenbruk blåtonene til status, kategori eller navigasjon |
| Vis alltid tall + tekstetikett på score | Vis en farget prikk uten tall ved siden av |
| Hold aksentblått til étt formål: handling | Bruk aksentblått dekorativt eller til flere ting samtidig |
| Flat, tone-basert dybde | Skygger, gradienter, glassmorfisme |
| `tnum` på alle sammenlignbare tall | La tall variere i tegnbredde og hoppe rundt ved oppdatering |
