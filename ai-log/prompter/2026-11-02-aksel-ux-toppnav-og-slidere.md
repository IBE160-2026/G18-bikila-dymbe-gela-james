# 2026-11-02: Logo, én forklaringslenke og slidere som starter til venstre (Story 2.1b)

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5) i VS Code, `bmad-ux` (Sally, oppdatering) og `bmad-build` (Amelia, oneshot) med gjennomgang
**Fase:** Gjennomføring
**Resultat:** Logoen i toppnavigasjonen, lenken «Slik beregner vi SnowScore» bare én gang på Utforsk, og alle fem filterslidere starter på «Alle» til venstre. DESIGN.md og EXPERIENCE.md er oppdatert.

## Prompter

### 1
> kan du be agenten om å gjøre ux designet på selve nettsiden bedre. inkluder snowfinders logo som skal være ved siden av snowfinder. Trenger ikke å ha med slik beregner vi snowscore to ganger (dobbelt opp) holder med en gang. ønsker også at slicerne vind, temperatur, skydekke i dagslys og avstand starter til venstre slik som sliceren på nysnø

Vedlegg: `SnowFinder_logo.svg` og to skjermbilder av toppen av Utforsk og filterpanelet.

**Svar (kort):** Claude leste koden og la fram en plan med tre punkter.
- Logoen står til venstre for «SnowFinder» og er dekorativ.
- Lenken ved Kart/Liste fjernes, mens lenken i toppnavigasjonen og lenken i SnowScore-kortet beholdes.
- Sliderne for vind, temperatur, skydekke og avstand speiles, så alle starter på «Alle» til venstre.

**Hva vi gjorde med det:** Se 2.

### 2 (valg)
> Spørsmål: Godkjenner du planen? Svar: «Godkjenn planen (Recommended)»

**Svar (kort):** Sally oppdaterte DESIGN.md og EXPERIENCE.md (begge kopier), og Amelia bygde endringen. Claude valgte `dir="rtl"` i stedet for å regne om verdiene, så adressen, `aria-valuenow` og testene beholder det ekte tallet. Piltast høyre gjør kravet strengere, slik planen sa.
**Hva vi gjorde med det:** Setningen «høyre og opp» i EXPERIENCE.md ble rettet til planen: opp og ned følger tallet.

### 3 (valg etter gjennomgangen)
> Spørsmål: Story 2.1 krever lenke fra kartet og listen, og på mobil ligger toppmenyen bak ☰. Svar: «Bare én synlig om gangen (Recommended)»

**Svar (kort):** Lenken ved Kart/Liste vises bare under 768 px, og toppmenyens lenke vises fra 768 px. Den står aldri to ganger, og kravet i 2.1 er fortsatt oppfylt.
**Hva vi gjorde med det:** Bygget, med E2E på begge bredder. Story 2.1b er ført inn i epic-fila.

### 4
> hvor lang tid bruker den?

**Svar (kort):** Gjennomgangen var fortsatt i gang og ventet ferdig om ett til tre minutter.

### 5
> puch etterpå
