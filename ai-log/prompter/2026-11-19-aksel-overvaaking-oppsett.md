# 2026-11-19: oppsett av overvåkingsagenten

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `/schedule` (RemoteTrigger) og `bmad-correct-course`
**Fase:** Gjennomføring
**Resultat:** Rutinen `SnowFinder-overvåking` (kl. 06, 12, 18 og 24, Sonnet 5.5, bare lese-verktøy) er opprettet. Den
kom ikke fram til nettsiden, så et endringsforslag lar den lese datafila og publiseringen gjennom GitHub. Rutinen er av
til PR-en er merget.

## Prompter

### 1
> ja sett opp overvåkningsagenten

**Svar (kort):** Claude foreslo oppsettet (kl. 05, 11, 17, 23 UTC, Sonnet 5.5, Bash/Read/Glob/Grep, ingen connectors)
og ba om bekreftelse.
**Hva vi gjorde med det:** brukt. Valg i dialog: «Ja, opprett (Anbefalt)».

### 2
Prøvekjøring kl. 22.46.

**Svar (kort):** Agenten leste instruksen og issues, men nettverkssperren i skymiljøet stoppet nettsiden (403). Den
laget ingen issue og varslet Aksel.
**Hva vi gjorde med det:** Aksel ble bedt om å tillate domenet i miljøet.

### 3
> ja nå er momenet lagt til

**Svar (kort):** Fortsatt blokkert. Claude prøvde det andre miljøet med samme navn, som også var blokkert og hentet en gammel `main`,
og satte rutinen tilbake.
**Hva vi gjorde med det:** brukt.

### 4
> ja den er lagret prøv igjen

**Svar (kort):** Fortsatt blokkert kl. 23.11.
**Hva vi gjorde med det:** brukt.

### 5
> ja, satt til full tilgang nå

**Svar (kort):** Fortsatt blokkert kl. 23.18, så innstillingen gjelder ikke rutinen.
**Hva vi gjorde med det:** brukt.

### 6
> her er skjembilde / her

**Svar (kort):** Skjermbildet viste rutinen med «Default · Sonnet 5.5», men ikke hvilket av de to miljøene den bruker.
Claude foreslo å gi miljøet et nytt navn.
**Hva vi gjorde med det:** gikk ikke. Aksel fikk ikke endret navnet eller åpnet miljøet.

### 7
Valg i dialog: «Les fra grenen data (Anbefalt)».

**Svar (kort):** Rutinen ble slått av, og `bmad-correct-course` lagde endringsforslaget. Agenten leser `latest.json` på grenen
`data` (samme fil som `vercel.json` viser) og statusen `Vercel` på `main`. Den ser ikke om siden er nede.
**Hva vi gjorde med det:** brukt.

### 8
> ja godkjent og lag pr

**Svar (kort):** Følgende er endret i én `docs/`-PR:
- NFR-6 (begge kopiene);
- SRS-N-11 (versjon 2.6);
- AD-11 (begge kopiene);
- epics;
- README;
- `drift/overvaakingsagent.md`.
**Hva vi gjorde med det:** brukt.
