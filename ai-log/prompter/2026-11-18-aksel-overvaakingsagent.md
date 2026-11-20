# 2026-11-18: en agent som overvåker nettsiden

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-party-mode` med John, Sally, Winston, Amelia, Murat, Victor,
Carson og Mary, deretter `bmad-correct-course`
**Fase:** Gjennomføring
**Resultat:** Et godkjent endringsforslag for en agent som overvåker nettsiden. NFR-6, SRS-N-11 (versjon 2.5)
og AD-11 er oppdatert, og instruksen står i `drift/overvaakingsagent.md`. Arbeidet ble gjort i en egen
worktree (`docs/overvaakingsagent`), mens en annen Claude-økt jobbet med Story 1.12.

## Prompter

### 1
> hei kan du jobbe paralent med den andre cloude i samme repo

**Svar (kort):** Ja, men ikke i samme mappe og ikke på samme grein. To økter i én arbeidsmappe overskriver
hverandres filer, og `git checkout` hos den ene bytter grein for den andre. Delte filer som
`fremdriftsplan.md` og `ai-log/logg.md` gir flettekonflikter, og bare én økt kan kjøre E2E om gangen
(port 4173 og 4174).
**Hva vi gjorde med det:** brukt.

### 2
> den andre cloude fanen jobber med stori 1.12

**Svar (kort):** Da holder denne økten seg unna Story 1.12 og jobber i en egen worktree. Alle v1-stories er
bygget. Forslag til arbeid som ikke krysser 1.12: sluttrapporten, brukertesten, presentasjonen, review av
PR #113 eller utsatte funn.
**Hva vi gjorde med det:** brukt.

### 3
> la agentene sitte langs en rundbord og kom med enda bedre brukeropplevelse og forbedringer av nettsiden. kan agentene drifte nettsiden selv?

**Svar (kort):** Rundbord i `bmad-party-mode`. Sally og Mary: la brukertesten styre UX-rettingene, og bygg
bare overlappet med rommets ideer (tom treffliste, «hvorfor denne scoren» på kortet), høyst tre `fix/` før
28. november. Om drift skilte Winston mellom tre nivåer: automatisering uten KI (som finnes i dag), en agent
som leser og melder fra, og en agent som endrer og publiserer. Murat og John avviste nivå 3, fordi `main` er
produksjon og hver story-PR skal godkjennes av et gruppemedlem.
**Hva vi gjorde med det:** brukt. Nivå 3 avvist.

### 4
> en agent skal overvåke siden . vi vil motta svarene fra brukertesten i morgen

**Svar (kort):** Nivå 2 er valgt. Winston fant hullet: stopper kjeden mellom `data-timer.yml` og `data.yml`,
blir ingen kjøring rød. Murat foreslo kravene: sjekk utenfra, ett issue på norsk med diagnose og ingen
skrivetilgang til kode. En ny tjeneste må gjennom `bmad-correct-course`.
**Hva vi gjorde med det:** brukt.

### 5
> ja sett i gang

**Svar (kort):** Laget worktreen `C:/Users/Aksel/sf-overvaaking` på greinen `docs/overvaakingsagent` og
startet `bmad-correct-course`. Funn: NFR-6 sa «ingen egen varslingskanal», NFR-3 har grensen 3 timer (ikke
90 min), og en Actions-jobb uten KI kjører på den samme planleggeren som droppet 283 av 290 kjøringer
4. november. Fire spørsmål til Aksel. Svarene var: planlagt Claude-agent, Aksels konto, issue over 2 timer,
og i drift før 28. november.
**Hva vi gjorde med det:** brukt. Actions-jobb uten KI, begge, og grensene 3 timer og 90 minutter forkastet.

### 6
> ja godkjent , gjør endringene og lag pr

**Svar (kort):** Endringene i PRD (begge kopiene), SRS, epics, arkitektur (begge kopiene), README og
fremdriftsplanen, instruksen `drift/overvaakingsagent.md`, etiketten `overvåking` og en `docs/`-PR.
**Hva vi gjorde med det:** brukt.
