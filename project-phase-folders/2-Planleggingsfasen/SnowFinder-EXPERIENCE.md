---
name: SnowFinder
status: draft
sources:
  - project-phase-folders/2-Planleggingsfasen/SnowFinder-PRD.md
  - project-phase-folders/1-Oppstartsfasen/SnowFinder-Produktbrief.md
  - project-workspace/planning-artifacts/sprint-change-proposal-2026-10-07.md
  - project-workspace/planning-artifacts/sprint-change-proposal-2026-10-07-forenkling.md
updated: 2026-10-28
---

# SnowFinder — Experience Spine

**v2 (2026-10-07):** Oppdatert etter forenklingen. Snøvarsel, tilbakemelding og installerbar app
(PWA) er «Ikke i v1». Nytt: demobanneret og panelet for datakvalitet på forklaringssiden.
Banneret for gamle data vises når dataene er eldre enn normalt, ikke ved en kretsbryter.

## Foundation

Responsiv webapp (statiske filer), mobil og desktop likestilt (ikke mobil-først med desktop som
ettertanke — brief og PRD er eksplisitte på at begge er primære bruksmåter). Ingen UI-system
arvet (React + egen komponentsone per `SnowFinder-DESIGN.md` — arkitekturens stack har ikke låst
shadcn/MUI/Tailwind). *(v2: Ikke installerbar som PWA i v1, siden push-varsler er tatt ut.)*
Ingen brukerkonto noe sted — hver økt er anonym; «innlogget tilstand» finnes ikke i IA-en under.
Appen leser én publisert datafil og skriver ingenting. Uten ferske data (rent klon) vises et
demodatasett, tydelig merket.

## Informasjonsarkitektur

| Flate | Nås fra | Formål |
|---|---|---|
| Utforsk (kart) | `/` (standard) | Norgeskart fargelagt etter SnowScore, primær inngang |
| Utforsk (liste) | `/` med `visning=liste`, eller «Vis som liste»-lenke fra kartet | Samme steder/filter som kartet, tastaturnavigerbar liste — fullverdig alternativ, ikke en degradert reserve (PRD FR-13) |
| Stedsside | Trykk på kartmarkør, listerad, eller direkte delt lenke `/sted/:id` | Stedsnavnet som overskrift, SnowScore med delpoeng, «Grunnlag» (rådata, høyde og dataalder) og beste skivindu. «Tilbake» nederst går tilbake til søket. Stedstypen vises ikke. |
| Slik beregner vi SnowScore | Toppnavigasjon, eller lenke fra ethvert score-badge | Forklaring, regneeksempel, datakilder og begrensninger, datakvalitet for siste kjøring, «prøv selv»-kalkulator (Bør ha) |

*(v2: Flaten «Tilbakemelding» er Ikke i v1.)*

**Navigasjon:** Fast toppnavigasjon på alle bredder (ikke bunn-faner) — «SnowFinder» (til
Utforsk) · «Slik beregner vi SnowScore». På mobil kollapser dette til en
enkel meny (☰), men Utforsk-flaten selv (kart/liste-vekslingen) ligger alltid rett under
navigasjonen, aldri bak et ekstra trykk — det er forsiden.

**Filter og visningsmodus er begge del av URL-tilstanden** (PRD FR-21): en delt lenke gjenskaper
nøyaktig samme filterverdier *og* samme visning (kart eller liste) hos mottakeren. Mangler
`visning`-parameteren, er standard `kart`.

→ Komposisjonsreferanse: [wireframe-utforsk](wireframes/wireframe-utforsk-2026-10-28.excalidraw)
(kart, liste, bunn-ark og null treff). Stedssiden og forklaringssiden: se Wireframes nedenfor.

## Tone og mikrotekst

Rolig, presis, aldri alarmerende eller selgende — SnowFinder lover aldri snø eller sikkerhet
(brief, Ethical Considerations).

| Do | Don't |
|---|---|
| «Prognose — oppdatert for 42 min siden» | «Garantert pudder!» |
| «Ingen treff. Prøv vind høyst 8 m/s.» med knappen «Bruk forslaget» | «Ingen resultater» (uten forslag) |
| «Viser siste kjente data fra kl. 14:00 — MET svarer ikke nå» | «Feil: API timeout» |
| «Ufullstendige data for dette stedet» | Vise 0 eller en gjettet poengsum |
| «Mørketid – vindu vist uten dagslys» | La skivindu-kortet forsvinne stille |
| «Fant ikke noe skivindu de neste 48 timene.» | Skjule kortet når det snør hele perioden |
| «Siste 24 t (NVE, modellert)» og «ikke målt snø» i hjelpeteksten | Kalle NVEs modellerte nysnø for målt snø |
| «Demodata – ikke ekte prognoser» | Vise demodata uten merking, som om de var ekte |
| «Siste kjøring: 297 av 300 steder gyldige, kl. 14:05» | «Datakvalitet: OK» uten tall |

## Komponentmønstre

Atferd. Visuelle spesifikasjoner ligger i `SnowFinder-DESIGN.md.Components`.

| Komponent | Bruk | Atferdsregler |
|---|---|---|
| Toppnavigasjon | Alle flater, øverst | «SnowFinder» (til kartet) og «Slik beregner vi SnowScore». Under 768 px ligger lenken bak knappen ☰ (`aria-label="Meny"`, `aria-expanded`), og menyen lukkes når brukeren går til en annen side. Gjeldende side har `aria-current="page"` og vises med fet skrift og understrek, ikke bare farge. |
| Kart \| Liste-veksling | Utforsk, rett under navigasjonen | To lenker, «Kart» og «Liste», ikke en bryter som bare finnes i JavaScript: valget står i URL-en (`visning=liste`), så Tilbake og delte lenker beholder det. Den valgte har `aria-current="page"`. Begge lenkene beholder filter og sortering. Lenken «Slik beregner vi SnowScore» står på samme linje. |
| Kartmarkør | Utforsk (kart) | Klikk/trykk åpner stedsside. Hover (desktop) viser stedsnavn + score i tooltip. *(v3, 2026-10-08)* Ingen klynging: markørene er små på landsnivå og vokser når brukeren zoomer inn (mål i DESIGN.md `{components.map-marker}`), så ingen sted forsvinner inn i en klynge. |
| Listerad | Utforsk (liste) | Hele raden er én lenke: Tab-navigerbar, Enter åpner stedsside. Stedsnavn, score-badge og nøkkeltall (nysnø, vind, temperatur). |
| Sorteringsvalg | Utforsk (liste), over radene | En ordinær `<select>` med etiketten «Sorter etter» og valgene «Score», «Avstand» og «Navn», aldri en museavhengig dra-og-slipp. «Score» og «Navn» står i URL-en. «Avstand» ber om posisjonen først når brukeren velger det, og posisjonen blir bare i minnet (se Tilstandsmønstre, avslått posisjon). |
| Score-badge | Overalt SnowScore vises | Tall + tekstetikett alltid sammen. Trykk/tap gjør ingenting i seg selv (badge er ikke en egen lenke) — hele kortet/raden er klikkmålet. Trinn og etikett følger tersklene i tabellen under Colors i DESIGN.md (70 «Svært godt», 45 «Godt», 20 «Middels», 0 «Lite»). |
| Filterpanel | Utforsk (kart + liste) | Slidere for nysnø/vind/temperatur (Må ha) + skydekke i dagslys/avstand (Bør ha), pluss avkrysning for stedstype og valg av datagrunnlag for nysnø (Bør ha). Antall treff oppdateres live (`aria-live="polite"`) mens sliderne justeres. Nullstill-knapp alltid synlig når minst ett filter avviker fra standard. Alle krav kombineres med OG. Under 768 px ligger panelet i bunn-arket, fra 768 px er det et fast sidepanel. |
| Bunn-ark | Utforsk, under 768 px | Lukket viser det knappen «Filter» med antall treff, de aktive kravene som chips (ren tekst, ikke knapper) og «Nullstill». Knappen åpner og lukker arket (`aria-expanded`), ingen dra-gest. Åpent viser det hele filterpanelet, høyst 60 % av skjermhøyden og med egen rulling. Arket står fast nederst over kartet og skjuler aldri siste listerad. |
| Skydekke i dagslys *(Story 3.5)* | Filterpanel | Slider «Skydekke i dagslys», høyst X % i steg på 10. Hjelpeteksten sier «Steder uten dagslys de neste 24 timene (mørketid) vises ikke når kravet er på.» |
| Stedstype *(Story 3.7)* | Filterpanel | Tre avkrysningsbokser, «Skisted», «Fjelltopp» og «By», i en gruppe med overskriften «Stedstype». Ingen avkrysset betyr «Alle» og er standard; å fjerne siste kryss gir «Alle» igjen, aldri null treff. Hjelpeteksten «Ingen avkrysset viser alle stedstyper.» er koblet til gruppen med `aria-describedby`. Chip på det lukkede bunn-arket: «Stedstype skisted, by». Ved null treff kan forslaget være «Prøv uten stedstypekravet.» |
| Datagrunnlag for nysnø *(Story 3.8)* | Filterpanel, under nysnø-slideren | To radioknapper: «Prognose (MET, neste 24 t)» (standard) og «Siste 24 t (NVE, modellert)». Aldri deaktivert. Hjelpeteksten sier at NVEs verdier er modellerte estimater fra seNorge, ikke målt snø, og at 1 mm vannekvivalent regnes som omtrent 1 cm snø. Listen viser nysnø fra kilden filteret bruker. Forslaget ved null treff bytter aldri kilde. Chip når kilden er valgt mens nysnø står på «Alle»: «Datagrunnlag siste 24 t (NVE)». |
| Hurtigvalg-chip | Filterpanel | «Pudderdag», «Sol etter snøfall» — trykk fyller filteret og oppdaterer resultatet i samme handling, ingen bekreftelsesdialog. |
| SnowScore-kortet | Stedsside, øverst | Overskriften «SnowScore», score-badge med tallet i `display`, og delpoengene «A Nysnøpotensial», «B Kuldebonus» og «C Snøandel» som «x av 60», «x av 25» og «x av 15». Ved ufullstendige data vises bare teksten «Ufullstendige data», uten delpoeng. Lenken «Slik beregner vi SnowScore» står nederst i kortet. |
| Grunnlag-kortet | Stedsside | Overskriften «Grunnlag» og rådataene som etikett og verdi: nysnø neste døgn, temperatur, maks vind, skydekke, skydekke i dagslys, høyde og NVE-nysnø siste døgn. En verdi som mangler, vises som «–». Nederst kilden og tidspunktet: «Prognose fra MET, oppdatert …». |
| «Tilbake» | Stedsside, nederst | Går ett steg tilbake i historikken når stedssiden ble åpnet fra appen, så kart eller liste og filteret er som før. Ble siden åpnet fra en delt lenke, går den til søket som står i lenken. |
| Beste skivindu-kort *(Story 4.2)* | Stedsside | Vises alltid. Tidsrom i norsk tid («fredag 13–17») og en begrunnelse («Snittvind 1 m/s, skydekke 91 %, etter snøfallet»). Finnes ikke fire sammenhengende dagslystimer, vises det beste kortere vinduet med «Bare N sammenhengende dagslystimer» («timer» i mørketid, entall ved 1). Kortet leser bare dataprogrammets felt, også mørketid-flagget, og regner aldri dagslys selv. Variantene er tegnet i [wireframe-stedsside](wireframes/wireframe-stedsside-2026-10-28.excalidraw), ramme 4–5. |
| Kalkulator («prøv selv») | Forklaringsside | To numeriske inndata (nedbør, temperatur) → live-oppdatert A/B/C + sum, samme modul som dataprogrammet (PRD FR-10, Bør ha). |
| Demobanner | Alle flater, øverst under navigasjonen | Vises når datafilen er demodata (`mode: "demo"`): «Demodata – ikke ekte prognoser». Kan ikke lukkes, men blokkerer ingenting. Lenker til README-avsnittet om ekte data. |
| Banner-stale-data | Alle flater, øverst under navigasjonen | Vises når de nyeste dataene er eldre enn normalt (over 90 min, NFR-3): «Viser siste kjente data fra kl. XX:XX». Blokkerer ikke bruk av resten av siden. Utløses av dataalder, ikke av en kretsbryter. *(Ikke bygget ennå, Story 1.6.)* |
| Datakvalitetspanel | Forklaringsside | Viser siste publiserte kjørings kvalitetsrapport i klartekst: tidspunkt, antall steder, andel gyldige, avviste svar per kilde og antall med ufullstendige data (NFR-DQ2). Ingen grafer kreves; en enkel tabell eller liste. |

*(v2: Snøvarsel-knapp/-skjema og tilbakemeldingsskjema er Ikke i v1.)*

## Tilstandsmønstre

| Tilstand | Flate | Behandling |
|---|---|---|
| Laster (kaldstart) | Alle flater | Kart og liste: et skjelett i `{colors.surface-sunken}` med samme form som kartet eller listen, så siden ikke hopper når dataene kommer. Stedssiden: et enkelt skjelett. Skjermleseren hører «Laster stedsdata» (`role="status"`). Ingen spinner-only-skjerm. Forklaringssiden vises med en gang; bare datakvalitetspanelet venter og sier «Henter kvalitetsrapporten for siste kjøring …». |
| Datafilen lar seg ikke laste | Kart/liste/stedsside | «Klarte ikke å lese stedsdataene. Prøv å laste siden på nytt senere.» (`role="alert"`). Forklaringssiden vises likevel, og datakvalitetspanelet sier «Kvalitetsrapporten kunne ikke lastes. Last inn siden på nytt for å prøve igjen.» Lar kartbiblioteket seg ikke laste, står «Kartet kunne ikke lastes. Last siden på nytt.» i stedet for kartet. |
| Null treff | Kart/liste | Teksten over kartet eller listen sier hvilket krav som kan lempes: «Ingen treff. Prøv vind høyst 8 m/s.» Knappen «Bruk forslaget» setter verdien med ett trykk og flytter fokus til glideren for det kravet, og «Nullstill» står ved siden av. Hjelper det ikke å endre ett krav: «Det hjelper ikke å endre bare ett krav. Prøv «Nullstill».» Aldri en tom flate uten handling. Se [wireframe-utforsk](wireframes/wireframe-utforsk-2026-10-28.excalidraw), ramme 5. |
| Utdatert data (3–12 t) | Stedsside, kort, liste | Liten `meta`-tekst «Utdatert» + tidsstempel, ingen blokkering av visning. |
| Data for gammel (>12 t) | Kart/liste/stedsside | Stedet vises ikke i det hele tatt (fjernet fra resultater, jf. NFR-3) — ikke vist gråtonet, faktisk fjernet, så brukeren aldri handler på for gammel info. Åpnes en delt lenke `/sted/:id` til et slikt sted, sier stedssiden «Dataene for dette stedet er for gamle til å vises» med lenken «Gå til kartet». |
| Alle steder fjernet | Utforsk | Er alle stedene for gamle, vises overskriften «Ingen ferske data», teksten «Ingen steder har ferske nok data akkurat nå. Last inn siden på nytt for å hente de nyeste dataene.» og knappen «Last inn på nytt». Kart \| Liste-vekslingen og filteret vises ikke, siden det ikke er noe å vise. |
| Fant ikke stedet | Stedsside | En lenke `/sted/:id` til et sted som ikke finnes i datafilen: «Fant ikke stedet» med lenken «Gå til kartet», som beholder søket fra lenken. |
| Fant ikke siden | Alle adresser appen ikke kjenner | «Fant ikke siden» med lenken «Gå til kartet». |
| Avslått posisjon | Filterpanel (avstand), sorteringsvalget | Avstandsfilteret: «Fikk ikke tilgang til posisjonen din. Avstandskravet har ingen effekt.» Sortering etter avstand: «Fikk ikke tilgang til posisjonen din. Listen er sortert etter score.» (eller rekkefølgen som står i URL-en). Mens nettleseren spør: «Henter posisjonen din …». |
| MET-prognose mangler | Stedsside, Grunnlag-kortet | «Prognosen fra MET mangler for dette stedet.» i stedet for kilde og tidspunkt. |
| Gamle data | Global banner | Banner-stale-data (se Komponentmønstre) øverst når de nyeste dataene er eldre enn normalt (over 90 min, NFR-3), for eksempel fordi en datakilde er nede: «Viser siste kjente data fra kl. XX:XX». Blokkerer ikke bruk av resten av siden. *(v2: utløses av dataalder, ikke av en kretsbryter.)* |
| Demodata | Global banner | Demobanneret (se Komponentmønstre). Alder regnes mot demodatasettets egen «nå», så «Utdatert» og «fjernet» oppfører seg likt hver gang. |
| Ufullstendige data | Stedsside, kort | Tekst «Ufullstendige data» i stedet for et score-badge — aldri en tallverdi som ser reell ut. |
| Mørketid (skivindu) | Stedsside | «Mørketid – vindu vist uten dagslys», vinduet beregnes blant alle timer. |
| Ingen skivindu | Stedsside | «Fant ikke noe skivindu de neste 48 timene.» når det snør hele perioden eller data mangler. Kortet blir stående. |
| NVE-data mangler | Filterpanel | Med «Siste 24 t» valgt og ingen NVE-verdier i kjøringen: «NVE-data mangler i denne kjøringen. Velg «Prognose» for å filtrere på nysnø.» |
| Ugyldig inndata | Kalkulator, filterfelt | Feilmelding rett under feltet, programmatisk koblet (`aria-describedby`). |
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
  et bunn-ark. Lukket viser det knappen «Filter» og de aktive kravene som chips. Knappen åpner
  arket (Story 3.1, 2026-10-22: en knapp virker med tastatur og skjermleser). Stedsside er én kolonne; beste skivindu-kort ligger under SnowScore-kortet med delpoengene, over grunnlaget.
- **Desktop (≥768px):** Filterpanelet er et fast venstre sidepanel (ikke bunn-ark), kart/liste
  fyller resten. Stedsside bruker to kolonner (SnowScore med delpoeng og grunnlaget under hverandre til
  venstre, beste skivindu til høyre).
- **Wireframes:** Utforsk på begge bredder i
  [wireframe-utforsk](wireframes/wireframe-utforsk-2026-10-28.excalidraw), ramme 1–4. Stedssiden i
  [wireframe-stedsside](wireframes/wireframe-stedsside-2026-10-28.excalidraw), ramme 1–2.
- **PWA:** *(Ikke i v1, v2.)* Ingen installasjon eller install-prompt.

## Nøkkelflyter

### Flyt 1 — Sena planlegger helgetur til et skisted med nok nysnø (realiserer UJ-1)

1. Sena åpner SnowFinder på mobil torsdag kveld. Kart lastes med skjelett, deretter fargede
   markører.
2. Hun trykker «Filter», setter nysnø minst 15 cm og vind høyst 6 m/s. Antall treff oppdateres
   live for hver justering. (PRD-en sier 15 mm. Filteret bruker cm, og 1 mm nedbør regnes som
   omtrent 1 cm snø.)
3. Hun trykker et sterkt blått punkt i Trøndelag.
4. Stedssiden åpnes: SnowScore 82 med delpoeng, beste skivindu lørdag 10–14.
5. **Klimaks:** Hun ser delpoengene og forstår *hvorfor* — ikke bare tallet — og stoler på det.
6. Hun deler lenken (URL har filter + sted) med kjøreselskapet via melding.

Feil-gren: Ingen treff ved steg 2 → teksten over kartet sier «Ingen treff. Prøv vind høyst 8 m/s.»
i stedet for en tom flate. «Bruk forslaget» setter verdien med ett trykk og flytter fokus til
glideren, og «Nullstill» står ved siden av.

### Flyt 2 — Aksel følger opp et favorittsted uten å sjekke manuelt hver dag (UJ-2) *(Ikke i v1, v2)*

Beholdt for historikkens skyld. Snøvarsel er tatt ut av v1, så denne flyten bygges ikke.

1. Aksel er på Oppdal sin stedsside. Trykker «Varsle meg».
2. Inline-skjema: setter terskel 15 mm nysnø. Bekrefter.
3. Knappen blir «Følger dette stedet»; ingen navn/e-post/konto involvert.
4. To dager senere: push-varsel på telefonen når terskelen er oppfylt.
5. **Klimaks:** Han trykker varselet og havner rett på stedssiden — varselet var presist, ikke
   generisk.
6. Han melder seg av med ett trykk fra samme side; bekreftelse: «Varsel slettet.»

Edge case: Terskelen oppfylles flere døgn på rad → maks ett varsel per regel per døgn (ingen
gjentatt varsling samme dag selv om pipelinen kjører hver time).

### Flyt 3 — Kelly, som bruker skjermleser, finner et sted uten å bruke kartet (realiserer UJ-3)

1. Kelly tabber fra toppnavigasjonen til «Vis som liste».
2. Listen presenteres: hver rad har stedsnavn, SnowScore som tall+tekst, nøkkeltall — lesbart av
   skjermleser i naturlig rekkefølge.
3. Hun tabber til filterfeltene (ordinære skjemafelt, ikke kun visuelle slidere) og setter samme
   krav som i Flyt 1.
4. Skjermleseren annonserer oppdatert treff-antall via `aria-live` etter hvert felt.
5. Hun trykker Enter på ønsket rad.
6. **Klimaks:** Hun havner på nøyaktig samme stedsside som en kart-bruker ville gjort — ingen
   informasjon eller funksjonalitet er tapt ved å velge listen.

Feil-gren: Ingen treff ved steg 4 → skjermleseren hører «Ingen treff» sammen med forslaget via
`aria-live`, for eksempel «Ingen treff. Prøv vind høyst 8 m/s.». «Bruk forslaget» flytter fokus til
glideren for kravet som ble endret. Velger hun «Avstand» i sorteringsvalget og avslår posisjonen,
får hun høre at listen beholder rekkefølgen den hadde.

### Flyt 4 — Sensor åpner SnowFinder fra et rent klon (realiserer FR-30)

1. Sensor kloner repoet og kjører `npm ci && npm run dev` etter README.
2. Utforsk åpnes med kartet og demobanneret «Demodata – ikke ekte prognoser» øverst.
3. Hun ser ett sted merket «Ufullstendige data» og ett merket «Utdatert», slik demodatasettet er
   laget for.
4. Hun åpner «Slik beregner vi SnowScore» og ser datakvaliteten for demokjøringen.
5. **Klimaks:** Hun kjører `npm run data`, laster siden på nytt, og banneret er borte —
   samme app, nå med ferske, ekte prognoser.

Feil-gren: Har hun ikke nett, eller er under 95 % av stedene gyldige, publiserer `npm run data`
ingenting. Demodataene og demobanneret blir stående.

## Wireframes *(steg 8c, 2026-10-28)*

Wireframene viser appen slik den er bygget, på mobil (375 px) og desktop (1280 px). De åpnes på
excalidraw.com eller i Excalidraw for VS Code. Ved konflikt vinner denne fila og DESIGN.md.

| Flate | Fil | Rammer |
|---|---|---|
| Utforsk | [wireframe-utforsk](wireframes/wireframe-utforsk-2026-10-28.excalidraw) | Kart og liste på desktop; mobil med lukket bunn-ark (knappen «Filter» og chips), åpent bunn-ark og null treff med «Bruk forslaget» |
| Stedsside | [wireframe-stedsside](wireframes/wireframe-stedsside-2026-10-28.excalidraw) | Desktop og mobil; «Ufullstendige data»; mørketid; skivindu-kortet med kortere vindu og uten vindu |
| Slik beregner vi SnowScore | [wireframe-forklaring](wireframes/wireframe-forklaring-2026-10-28.excalidraw) | Desktop, mobil med ☰, og utsnitt av «Prøv selv» |

Tre ting i appen var annerledes enn dokumentet, og dokumentet er rettet etter appen (Aksel,
2026-10-28):

- Kartet har ingen tegnforklaring. Fargeskalaen står i verktøytipset, for eksempel «Hemsedal · 82 ·
  Svært godt».
- Stedssiden viser bare stedsnavnet i overskriften og høyden under «Grunnlag». Stedstypen vises
  ikke, og «Tilbake» står nederst.
- Forklaringssiden har rekkefølgen «Kort fortalt», «Steg for steg», «Regneeksempel», «Datakilder og
  begrensninger», «Datakvalitet», «Prøv selv» og «Endringslogg».

Tegnforklaring og stedstype på stedssiden er ført som mulige forbedringer i `deferred-work.md`.
Tegnforklaringen i wireframe-utforsk er merket «Finnes ikke i appen», og tallene i kartet og listen
der er merket som illustrasjon, ikke demodata.

## Kursets skjermkrav *(steg 8c, 2026-10-28)*

Denne seksjonen er ikke et byggekrav. Den kobler kursets skjermkrav til skjermer som finnes.

Emnet ber om wireframes for pålogging, profil, innsjekking, sosial feed og arrangementer.
SnowFinder har ingen kontoer, ingen database og ingen sosiale funksjoner (PRD §5), og pålogging er
droppet (2026-10-09). Aksel valgte å koble hvert av de fire andre kravene til den nærmeste skjermen
som finnes, uten nye funksjoner. Koblingen står også som merknader i wireframene.

| Kursets skjerm | SnowFinder-skjerm | Begrunnelse |
|---|---|---|
| Profil | Stedssiden | Stedet har en profil: navn, høyde, SnowScore, delpoeng, grunnlag og beste skivindu. SnowFinder handler om steder, ikke om brukere. |
| Innsjekking | Stedssiden før turen | Å «sjekke inn» er å sjekke forholdene før du drar: SnowScore, hvor gamle dataene er, og beste skivindu. |
| Sosial feed | Listevisningen | Listen sortert etter SnowScore er en feed av de beste stedene akkurat nå, oppdatert hver time. |
| Arrangementer | Kortet «Beste skivindu» | Det nærmeste SnowFinder har et arrangement, er tidspunktet det er best å dra. |
| Pålogging | *(droppet 2026-10-09)* | Ingen kontoer, så det finnes ingen påloggingsskjerm. Faglærer har ikke bekreftet (Åpne spørsmål 5). |

## Brukertestplan *(steg 8c, 2026-10-28)*

Denne seksjonen er ikke et byggekrav. Den er planen for å måle SM-2, SM-3 og SM-4 (PRD §9.3).

Gjennomføres innen F4 (forslag 2026-11-16) av Joseph og Aksel, med appen i demomodus
(`npm ci && npm run dev`), så alle deltakerne ser de samme dataene.

**Deltakere.** Minst fem personer med blandet erfaring, også noen utenfor studiet, fysisk eller via
Teams med skjermdeling. Én leder testen og én tar notater. Deltakerne samtykker muntlig til at
notatene brukes anonymt i sluttrapporten.

**Gjennomføring (ca. 20 min per person).** Kort introduksjon uten å forklare appen, så de fem
oppgavene med tenk-høyt. Testlederen hjelper bare når deltakeren står fast i over to minutter, og
noterer da oppgaven som «med hjelp». Til slutt SUS-skjemaet og to åpne spørsmål: «Hva var
vanskeligst?» og «Hva ville fått deg til å bruke SnowFinder før en skitur?»

| # | Oppgave | Måler | Mål |
|---|---|---|---|
| 1 | «Finn et skisted med minst 10 cm nysnø og vind høyst 10 m/s, og åpne det.» Riktig svar: Trysil (12,6 cm nysnø, vind 9,5 m/s, skisted). | Tid, og om den fullføres uten hjelp | SM-2: minst 4 av 5 på under 2 minutter uten hjelp |
| 2 | «Finn ut når det er best å dra til Hafjell de neste to dagene.» | Om deltakeren finner kortet «Beste skivindu» | Minst 4 av 5 uten hjelp |
| 3 | «Forklar med egne ord hvorfor Gaustatoppen har den poengsummen den har.» (58, Godt) | Om forklaringen nevner nysnø, nedbør som kommer som snø og/eller temperatur (delpoengene A, B og C). Vind teller ikke, fordi SnowScore ikke måler vind. | SM-3: minst 4 av 5 etter å ha lest forklaringssiden |
| 4 | «Send søket ditt til en venn, slik at hen ser de samme stedene.» | Om deltakeren kopierer adressen med filteret | Minst 4 av 5 uten hjelp |
| 5 | «Er snøen i Kirkenes målt i dag, eller er det en prognose? Hvor ferske er tallene?» Kirkenes er det eneste utdaterte stedet i demodataene (4 t). | Om deltakeren ser «Prognose», dataalderen og «Utdatert» | SM-4: minst 4 av 5 uten å bli fortalt det |

**SUS-skjemaet** (System Usability Scale, 1 = helt uenig, 5 = helt enig):

1. Jeg tror jeg vil bruke SnowFinder ofte.
2. Jeg syntes SnowFinder var unødvendig komplisert.
3. Jeg syntes SnowFinder var lett å bruke.
4. Jeg tror jeg ville trengt hjelp fra en teknisk person for å bruke SnowFinder.
5. Jeg syntes funksjonene i SnowFinder hang godt sammen.
6. Jeg syntes det var for mye som ikke stemte overens i SnowFinder.
7. Jeg tror de fleste vil lære seg SnowFinder raskt.
8. Jeg syntes SnowFinder var tungvint å bruke.
9. Jeg følte meg trygg da jeg brukte SnowFinder.
10. Jeg måtte lære meg mye før jeg kom i gang med SnowFinder.

Poengsum: oddetallsspørsmål gir svar − 1, partallsspørsmål gir 5 − svar. Summen ganges med 2,5,
så skalaen er 0–100.

**Suksesskriterier.** Hver oppgave måles mot målet i tabellen (SM-2, SM-3 og SM-4 fra PRD §9.3).
Samlet skal SUS-snittet være minst 68, og minst 80 % av alle oppgavene skal fullføres uten hjelp.
Funnene, med tall per oppgave og SUS per deltaker, går inn i sluttrapporten. Feil som må rettes før
levering, blir `fix`-PR-er med review.

## Åpne spørsmål (UX)

1. ~~Bør «Vis som liste» være en fane ved siden av kartet, eller en ren lenke/toggle over det?~~
   *(Løst 2026-10-08, Story 1.8: to lenker «Kart» | «Liste» rett under navigasjonen, med
   `aria-current`.)*
2. ~~Nøkkelskjerm-mockuper er ikke generert i denne runden — vurder en oppfølgingsøkt for
   kart/liste-flaten spesifikt, siden layout der er mer kritisk enn tabellene her fanger.~~
   *(Løst 2026-10-28: wireframes for Utforsk, stedssiden og forklaringssiden.)*
3. ~~*(v2)* Fra endringsrunde 1 står fortsatt U1 (wireframes for nøkkelskjermene), U2 (kursets
   skjermkrav koblet til SnowFinder) og U3 (brukertestplan med SUS).~~ *(Løst 2026-10-28, steg 8c:
   se Wireframes, Kursets skjermkrav og Brukertestplan over.)*
4. *(v3, 2026-10-08)* Små kartmarkører (10 px på landsnivå) er under kravet om trykkmål ≥ 44 px på
   mobil. Kartlaget er unntatt AA, og listen er det fulle alternativet. Vurder likevel en større,
   usynlig trykkflate rundt markørene.
5. Faglærer har ikke bekreftet at påloggingsskjermen i kursets skjermkrav kan droppes, siden
   SnowFinder ikke har kontoer (droppet av gruppa 2026-10-09). Eier: Joseph og Aksel.
