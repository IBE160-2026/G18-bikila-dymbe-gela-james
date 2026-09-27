---
name: SnowFinder
status: draft
sources:
  - project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md
  - project-phase-folders/1-Oppstartsfasen/SnowFinder-Produktbrief.md
updated: 2026-09-27
---

# SnowFinder — Experience Spine

## Foundation

Responsivt web-PWA, mobil og desktop likestilt (ikke mobil-først med desktop som ettertanke —
brief og PRD er eksplisitte på at begge er primære bruksmåter). Ingen UI-system arvet (React +
egen komponentsone per `SnowFinder-DESIGN.md` — arkitekturens stack har ikke låst
shadcn/MUI/Tailwind). Installerbar som PWA (nødvendig for push-varsler på iPhone, PRD FR-18/19).
Ingen brukerkonto noe sted — hver økt er anonym; «innlogget tilstand» finnes ikke i IA-en under.

## Informasjonsarkitektur

| Flate | Nås fra | Formål |
|---|---|---|
| Utforsk (kart) | `/` (standard) | Norgeskart fargelagt etter SnowScore, primær inngang |
| Utforsk (liste) | `/` med `visning=liste`, eller «Vis som liste»-lenke fra kartet | Samme steder/filter som kartet, tastaturnavigerbar liste — fullverdig alternativ, ikke en degradert reserve (PRD FR-13) |
| Stedsside | Trykk på kartmarkør, listerad, eller direkte delt lenke `/sted/:id` | Full poengsum, delpoeng, rådata, beste skivindu, snøvarsel-registrering |
| Slik beregner vi SnowScore | Toppnavigasjon, eller lenke fra ethvert score-badge | Forklaring, regneeksempel, «prøv selv»-kalkulator, datakilder |
| Tilbakemelding | Toppnavigasjon («Tilbakemelding») | Skjema uten konto, når som helst |

**Navigasjon:** Fast toppnavigasjon på alle bredder (ikke bunn-faner) — «SnowFinder» (til
Utforsk) · «Slik beregner vi SnowScore» · «Tilbakemelding». På mobil kollapser dette til en
enkel meny (☰), men Utforsk-flaten selv (kart/liste-vekslingen) ligger alltid rett under
navigasjonen, aldri bak et ekstra trykk — det er forsiden.

**Filter og visningsmodus er begge del av URL-tilstanden** (PRD FR-21): en delt lenke gjenskaper
nøyaktig samme filterverdier *og* samme visning (kart eller liste) hos mottakeren. Mangler
`visning`-parameteren, er standard `kart`.

→ Komposisjonsreferanse: ingen HTML-mockuper generert i denne runden (Fast-path, agent-kjede —
se `.memlog.md`). `[NOTE FOR UX: vurder å kjøre nøkkelskjerm-mockuper (Excalidraw eller HTML) i en
oppfølgingsøkt før Amelia bygger Utforsk-flaten, siden kart/liste-vekslingen er den mest
layoutkritiske skjermen.]` Spinen her vinner uansett ved konflikt.

## Tone og mikrotekst

Rolig, presis, aldri alarmerende eller selgende — SnowFinder lover aldri snø eller sikkerhet
(brief, Ethical Considerations).

| Do | Don't |
|---|---|
| «Prognose — oppdatert for 42 min siden» | «Garantert pudder!» |
| «Ingen treff. Prøv vind under 8 m/s i stedet» | «Ingen resultater» (uten forslag) |
| «Viser siste kjente data fra kl. 14:00 — MET svarer ikke nå» | «Feil: API timeout» |
| «Ufullstendige data for dette stedet» | Vise 0 eller en gjettet poengsum |
| «Mørketid — vindu vist uten dagslys» | La skivindu-kortet forsvinne stille |
| «Varsel slettet.» (etter avmelding) | Ingen bekreftelse i det hele tatt |

## Komponentmønstre

Atferd. Visuelle spesifikasjoner ligger i `SnowFinder-DESIGN.md.Components`.

| Komponent | Bruk | Atferdsregler |
|---|---|---|
| Kartmarkør | Utforsk (kart) | Klikk/trykk åpner stedsside. Hover (desktop) viser stedsnavn + score i tooltip. Klynger slås sammen kun ved svært lav zoom (unngår at markører forsvinner inn i en klynge brukeren må zoome for å finne). |
| Listerad | Utforsk (liste) | Tab-navigerbar, Enter åpner stedsside. Sorterbar (score/avstand/navn) via en ordinær `<select>` eller knapperad — aldri en museavhengig dra-og-slipp. |
| Score-badge | Overalt SnowScore vises | Tall + tekstetikett alltid sammen. Trykk/tap gjør ingenting i seg selv (badge er ikke en egen lenke) — hele kortet/raden er klikkmålet. |
| Filterpanel | Utforsk (kart + liste) | Slidere for nysnø/vind/temperatur (Må ha) + sol/avstand/stedstype (Bør ha). Antall treff oppdateres live (`aria-live="polite"`) mens sliderne justeres. Nullstill-knapp alltid synlig når minst ett filter avviker fra standard. |
| Hurtigvalg-chip | Filterpanel | «Pudderdag», «Sol etter snøfall» — trykk fyller filteret og oppdaterer resultatet i samme handling, ingen bekreftelsesdialog. |
| Beste skivindu-kort | Stedsside | Vises kun når vinduet finnes (Bør ha); mørketid-fallback-tekst når ingen dagslystimer finnes i perioden. |
| Snøvarsel-knapp/skjema | Stedsside | «Varsle meg» åpner et lite inline-skjema (terskelverdi + enhet), ikke en ny side. Etter registrering: knappen blir «Følger dette stedet» med en tydelig avmeldingslenke. |
| Tilbakemeldingsskjema | Tilbakemelding-flaten | Kategori (radio/select) + fritekst (tegnteller, maks 1000). Advarsel om personopplysninger vises statisk over feltet, ikke som popup. |
| Kalkulator («prøv selv») | Forklaringsside | To numeriske inndata (nedbør, temperatur) → live-oppdatert A/B/C + sum, samme modul som pipelinen (PRD FR-10). |

## Tilstandsmønstre

| Tilstand | Flate | Behandling |
|---|---|---|
| Laster (kaldstart) | Kart/liste | Skjelett-kort/-markører i `surface-sunken`, ingen spinner-only-skjerm. |
| Null treff | Kart/liste | «Ingen treff. Prøv {foreslått lempet krav} i stedet» — aldri en tom flate uten handling. |
| Utdatert data (3–12 t) | Stedsside, kort, liste | Liten `meta`-tekst «Utdatert» + tidsstempel, ingen blokkering av visning. |
| Data for gammel (>12 t) | Kart/liste/varsler | Stedet vises ikke i det hele tatt (fjernet fra resultater, jf. NFR-3) — ikke vist gråtonet, faktisk fjernet, så brukeren aldri handler på for gammel info. |
| Datakilde nede | Global banner | `banner-stale-data` øverst: «Viser siste kjente data fra kl. XX:XX». Blokkerer ikke bruk av resten av siden. |
| Ufullstendige data | Stedsside, kort | Tekst «Ufullstendige data» i stedet for et score-badge — aldri en tallverdi som ser reell ut. |
| Mørketid (skivindu) | Stedsside | «Mørketid – vindu vist uten dagslys», vinduet beregnes blant alle timer. |
| Skjemafeil (feedback/varsel) | Feedback, snøvarsel | Feilmelding rett under feltet, programmatisk koblet (`aria-describedby`), fokus flyttes til første feil ved innsending. |
| Suksess (varsel/tilbakemelding) | Stedsside, Tilbakemelding | Kort, konkret bekreftelse (se Tone-tabell) — ingen modal, ingen konfetti. |
| Fokus | Alle flater | Synlig fokusring i `{colors.accent}` på alt interaktivt — aldri `outline: none` uten erstatning. |

## Interaksjonsprimitiver

- Klikk/trykk for å velge sted (kart-markør, listerad) — ingen dra-og-slipp noe sted i v1.
- Slidere kan betjenes med mus, touch **og** piltaster (`role="slider"`, `aria-valuenow`).
- Ingen swipe-gester kreves for kjernefunksjoner (kart-panorering er unntatt — det er kartets
  native interaksjon, ikke en app-navigasjonsgeste).
- **Forbudt:** auto-avspillende bevegelse/animasjon, statusformidling utelukkende via farge,
  modaler som fanger fokus uten en synlig lukkeknapp, infinite scroll uten en tydelig
  "last flere"-handling.

## Tilgjengelighetsgulv

Atferd. Visuell kontrast ligger i `SnowFinder-DESIGN.md`. Gjelder alt unntatt selve det visuelle
kartlaget (PRD NFR-7 — Marys og Sallys eksplisitte avgrensning; kartlaget kompenseres av
listevisningen, som **er** fullt AA).

- SnowScore vises **aldri** kun som farge — alltid tall + tekstetikett, i badge, kart-tooltip og
  listerad likt.
- Alle interaktive elementer nåbare og betjenbare med tastatur alene: Tab-rekkefølge følger
  lesretning, synlig fokusring, Enter/Space aktiverer, piltaster betjener slidere.
- Filterets levende treff-antall annonseres til skjermleser via `aria-live="polite"` — en
  skjermleser-bruker som justerer en slider skal høre «14 treff» uten å måtte navigere bort og
  tilbake (realiserer UJ-3).
- Skjema-feil er programmatisk koblet til feltet (`aria-describedby`), ikke bare visuelt rødt.
- Trykkmål ≥ 44×44px (mobil), inkl. slider-gripepunkt og hurtigvalg-chips.
- `prefers-reduced-motion` respekteres: skjelett-fade og bunn-ark-animasjon droppes til et
  umiddelbart bytte.
- Kontrast ≥ 4.5:1 for brødtekst, ≥ 3:1 for stor tekst/UI-komponenter — inkludert hvert
  SnowScore-trinns tekstfarge mot sin bakgrunn (mørkeste trinn får hvit tekst, se DESIGN.md).

## Responsivt design og plattform

- **Brytpunkt:** én hovedbrytning ved ~768px (mobil vs. desktop-layout). Ingen egen
  nettbrett-spesifikk layout — nettbrett bruker desktop-layouten skalert ned.
- **Mobil (<768px):** Kart/liste fyller skjermen under toppnavigasjonen. Filterpanelet ligger i
  et bunn-ark som starter delvis synlig (viser aktive filterverdier som chips) og kan dras opp
  til full høyde. Stedsside er én kolonne, beste skivindu-kort og snøvarsel stables under
  hverandre.
- **Desktop (≥768px):** Filterpanelet er et fast venstre sidepanel (ikke bunn-ark), kart/liste
  fyller resten. Stedsside bruker to kolonner (rådata + delpoeng til venstre, beste skivindu og
  snøvarsel til høyre).
- **PWA:** Installerbar fra både mobil og desktop; installasjons-prompt vises kun etter at
  brukeren har besøkt en stedsside minst én gang (verdi må oppleves før install-tilbudet), aldri
  ved første sideåpning. `[ASSUMPTION: install-triggeret er ikke spesifisert i PRD/brief — dette
  er et rimelig, ikke-påtrengende standardvalg som kan justeres.]`

## Nøkkelflyter

### Flyt 1 — Sena finner et skisted med nok nysnø (realiserer UJ-1)

1. Sena åpner SnowFinder på mobil torsdag kveld. Kart lastes med skjelett, deretter fargede
   markører.
2. Hun drar opp bunn-arket, setter nysnø ≥ 15 mm og vind ≤ 6 m/s. Antall treff oppdateres live
   for hver justering.
3. Hun trykker et sterkt blått punkt i Trøndelag.
4. Stedssiden åpnes: SnowScore 82 med delpoeng, beste skivindu lørdag 10–14.
5. **Klimaks:** Hun ser delpoengene og forstår *hvorfor* — ikke bare tallet — og stoler på det.
6. Hun deler lenken (URL har filter + sted) med kjøreselskapet via melding.

Feil-gren: Ingen treff ved steg 2 → banneret foreslår «Prøv vind under 8 m/s i stedet» i stedet
for en tom flate.

### Flyt 2 — Aksel følger et sted og får varsel (realiserer UJ-2)

1. Aksel er på Oppdal sin stedsside. Trykker «Varsle meg».
2. Inline-skjema: setter terskel 15 mm nysnø. Bekrefter.
3. Knappen blir «Følger dette stedet»; ingen navn/e-post/konto involvert.
4. To dager senere: push-varsel på telefonen når terskelen er oppfylt.
5. **Klimaks:** Han trykker varselet og havner rett på stedssiden — varselet var presist, ikke
   generisk.
6. Han melder seg av med ett trykk fra samme side; bekreftelse: «Varsel slettet.»

Edge case: Terskelen oppfylles flere døgn på rad → maks ett varsel per regel per døgn (ingen
gjentatt varsling samme dag selv om pipelinen kjører hver time).

### Flyt 3 — Kelly finner et sted med skjermleser og tastatur (realiserer UJ-3)

1. Kelly tabber fra toppnavigasjonen til «Vis som liste».
2. Listen presenteres: hver rad har stedsnavn, SnowScore som tall+tekst, nøkkeltall — lesbart av
   skjermleser i naturlig rekkefølge.
3. Hun tabber til filterfeltene (ordinære skjemafelt, ikke kun visuelle slidere) og setter samme
   krav som i Flyt 1.
4. Skjermleseren annonserer oppdatert treff-antall via `aria-live` etter hvert felt.
5. Hun trykker Enter på ønsket rad.
6. **Klimaks:** Hun havner på nøyaktig samme stedsside som en kart-bruker ville gjort — ingen
   informasjon eller funksjonalitet er tapt ved å velge listen.

## Åpne spørsmål (UX)

1. Bør «Vis som liste» være en fane ved siden av kartet, eller en ren lenke/toggle over det?
   Spinen antar toggle (enklere IA, samme rute) — bekreft med Winston/Amelia før bygging.
2. Nøkkelskjerm-mockuper er ikke generert i denne runden — vurder en oppfølgingsøkt for
   kart/liste-flaten spesifikt, siden layout der er mer kritisk enn tabellene her fanger.
