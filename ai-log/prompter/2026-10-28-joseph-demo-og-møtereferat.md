# 2026-10-28: Statusside, klikkbar demo, PR #70 etter Story 3.8, og møtereferat

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5), uten BMad-agent, og `sesjonslogg`
**Fase:** Gjennomføring
**Resultat:**
- Statusside (HTML) med det som er ferdig, det som gjenstår, risikoer og råd. Den ligger utenfor repoet.
- Klikkbar demo av appen slik `main` er nå, bygget fra koden med demodata. Den finnes som publisert side og som én HTML-fil som virker fra `file://`. Repoet er ikke endret, men demofila har en tilpasning som lagrer stien i nettleserhistorikken.
- PR #70 kom i konflikt etter #71 (Story 3.8). `main` ble flettet inn, og M4 ble ført som nådd 2026-10-28. #69 ble lukket fordi #71 hadde gjort det samme.
- Møtereferat for 2026-10-28, med fordelingen: Aksel tar 1.11, 1.6 og 4.2, og Joseph koordinerer resten av fremdriftsplanen med Aksel. Ansvarlig er ført inn i aktivitetslisten og fremdriftsplanen.

Fortsetter [2026-10-28-joseph-milepaeler-og-aktivitetsliste.md](2026-10-28-joseph-milepaeler-og-aktivitetsliste.md).

## Prompter

### 19
> Commit og push til git , og etter det generer hvordan prosjektet er per nå og hvis det som ikke er ferdig i klikkbar html format. Det skal også vises råd på hva som må gjøres.

**Svar (kort):** Greinene var allerede pushet som #69 og #70. Statussiden ble publisert.

### 20
> send meg direkte lenke til oppdateringen

### 21
> hva med html filen ?

### 22
> du skulle generere klikkbar demo av hvordan produktet ser ut nå altså en simulering av alt som er ferdig nå

**Svar (kort):** Claude hadde misforstått. Det ekte bygget av appen ble publisert med demodata. Kartbakgrunnen fra Kartverket blokkeres på publiserte sider.

### 23
> hvor ligger den lokalt ?

### 24
> åpne demo-et i min browser

### 25
> send en direkte lenken fra c hard disken

**Svar (kort):** Chromium tillater ikke `pushState` til en annen sti fra `file://` (testet). Appen ble bygget til én fil der ruteren leser en sti som er lagret i nettleserhistorikken. Fila ble testet med Playwright: kart, liste, stedsside, tilbakeknapp og forklaringsside. Den ligger i `C:\Users\RAM\SnowFinder-demo\`.

### 26
> har du oppdatert milepæl planen, ser ikke det på git

### 27
> det går ikke an å reviewer pr 69 og 70 , hos aksel så står det at de ikke kan merges.

**Svar (kort):** #71 hadde satt 3.7 og 3.8 til `done` og endret de samme filene. `main` ble flettet inn i #70, og 3.8 ble tatt ut av det som gjenstår. Claude fikk ikke lov til å lukke #69, så den ble lukket på GitHub etterpå.

### 28
> er den pushet på git ?

### 29
> hvike av de kan vi ta i dag nå M1 Timesjobb og publisering (1.11) og M5 kodefrys: robusthet (1.6) og beste skivindu (4.2)

**Svar (kort):** 1.6 og 4.2 kan bygges nå. 1.11 er delvis blokkert: Pages er på med kilden «Deploy from branch», og bare faglærer kan endre den til «GitHub Actions».

### 30
> kjør et møtereferat på det vi gjørde i dag, samt at Aksel skal ta 4.2  M1 Timesjobb og publisering (1.11) og M5 kodefrys: robusthet (1.6) og beste skivindu (4.2).   og Joseph skal kordinerer med aksel å ta andre punkter i fremdriftsplanen. Nevnt at kelly og sena har fortsatt  flaggede kontoer og ikke kan jobber. Ta med alle ting vi har gjørt i dag ut fra git logg og oppdater møtereferat.

**Svar (kort):** Referatet ble skrevet fra git-loggen og PR-historikken. Joseph svarte at alle fire var til stede.
