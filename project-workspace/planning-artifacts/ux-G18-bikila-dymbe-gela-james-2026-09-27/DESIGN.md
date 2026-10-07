---
name: SnowFinder
description: Norsk snø-utforsker. Kald, klar, tillitsbyggende — tallet skal aldri virke gjettet. Lys som standard (utendørs, blendingsutsatt bruk), mørk modus støttet for kveldsplanlegging.
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
    radius: '{rounded.full}'
    borderWidth: '2px'
    borderColor: '{colors.surface-raised}'
  banner-stale-data:
    radius: '{rounded.sm}'
    background: '{colors.warning}'
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
mørk flate blender mindre men er vanskeligere å lese i sollys. Mørk modus følger systeminnstilling
for kveldsplanlegging hjemme. `[ASSUMPTION: lys som standard, ikke mørk — brief nevner begge
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
  brukeren lærer seg at «denne fargeskalaen betyr snøpotensial» og ingenting annet.
- **Danger/Warning/Success** er strengt semantiske og aldri dekorative: danger til feil og
  utdaterte/fjernede data, warning til «siste kjente data» når dataene er eldre enn normalt,
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
et sentrert innhold med maks bredde og samme 16px indre gutter i kolonner. Filterpanelet og
kartet/listen deler skjermen 50/50 på desktop (side ved side) og stables vertikalt på mobil med
filteret i et bunn-ark (bottom sheet) som kan trekkes opp — se Responsive & Platform i
EXPERIENCE.md for full oppførsel.

## Elevation & Depth

Ingen tunge skygger. SnowFinder er en flat, kartografisk flate — dybde kommer av tone
(`surface-base` → `surface-raised` → `surface-sunken`), ikke skygge. Ett unntak: bunn-arket
(filterpanel på mobil) og eventuelle modaler får en svak, kort skygge (`0 -2px 12px
rgba(15,27,45,0.08)`) utelukkende for å signalisere at de flyter over kartet — aldri på kort i
selve listen.

## Shapes

`{rounded.sm}` (6px) på input-felt og slidere. `{rounded.md}` (10px) på kort (stedskort,
listerader, forklaringsblokker). `{rounded.lg}` (16px) på store paneler (bunn-ark, modaler).
`{rounded.full}` utelukkende på score-merket og kartmarkører — sirkelen er reservert for
SnowScore-visning, slik at en bruker lærer «rundt = poengsum».

## Components

- **Score-badge** — Sirkulær/pill-formet merke. Bakgrunn = riktig SnowScore-trinn
  (`{colors.snowscore-0..3}`), tekst = ink-primary eller hvit (velg for kontrast ≥4.5:1 mot
  bakgrunnen — mørkeste trinn får hvit tekst). Viser **alltid** tallet og en kort tekstetikett
  («82 · Svært godt»), aldri bare farge (WCAG-krav, se EXPERIENCE.md Accessibility Floor).
- **Kartmarkør** — Sirkel, `{components.map-marker.size}`, farget etter SnowScore-trinn, hvit
  kant for kontrast mot alle bakgrunnskart-tiles. Valgt sted får en tykkere aksent-kant
  (`{colors.accent}`).
- **Location-card / listerad** — `{colors.surface-raised}` kort med stedsnavn (`heading`),
  score-badge, og tre nøkkeltall (nysnø/vind/temp) i `numeric`.
- **Filter-slider** — Tynt spor, stort gripepunkt (24px, langt over 44px trykkmål med padding),
  aksentfarget fylt del. Levende tallverdi vises alltid ved siden av sliderens gripepunkt, ikke
  bare i et hjørne.
- **Banner-stale-data** — Full bredde, warning-bakgrunn, ink-primary tekst (ikke hvit — bedre
  kontrast mot gult/oker). Vises når de nyeste dataene er eldre enn normalt (over 90 min), for
  eksempel fordi en datakilde er nede.
- **Banner-demo** *(v2)* — Full bredde, `{colors.surface-sunken}` bakgrunn med tynn
  `{colors.ink-secondary}`-kant og ink-primary tekst: «Demodata – ikke ekte prognoser». Bevisst
  nøytral og ikke warning-farget, så den ikke forveksles med banneret for gamle data.
  `[ASSUMPTION: fargevalget er ikke bestemt av gruppa — nøytrale, eksisterende tokens valgt for å
  unngå nye farger; kan endres.]`
- **Datakvalitetspanel** *(v2)* — `{colors.surface-raised}` kort på forklaringssiden med
  tallene i `numeric`. Bruker ikke SnowScore-skalaen; avviste svar vises som tall, ikke i
  danger-rødt.
- **Beste skivindu-kort** — `surface-sunken` bakgrunn (skiller det visuelt fra rådata-kortene
  rundt), tidsromtekst i `heading`, begrunnelse («etter nattens snøfall») i `meta`.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Bruk SnowScore-skalaen kun til SnowScore | Gjenbruk blåtonene til status, kategori eller navigasjon |
| Vis alltid tall + tekstetikett på score | Vis en farget prikk uten tall ved siden av |
| Hold aksentblått til étt formål: handling | Bruk aksentblått dekorativt eller til flere ting samtidig |
| Flat, tone-basert dybde | Skygger, gradienter, glassmorfisme |
| `tnum` på alle sammenlignbare tall | La tall variere i tegnbredde og hoppe rundt ved oppdatering |
