# Endringsforslag 2026-11-18: en agent som overvåker nettsiden

**Status:** godkjent av Aksel 2026-11-18
**Modus:** samlet
**Omfang:** lite (driftsoppgave, ingen ny story og ingen endring i appen)

## 1. Problemet

Når dataprogrammet stopper helt, merker ingen det før en bruker ser «utdatert» på siden.

- **Det som skjer i dag:** `data.yml` henter data omtrent hver time, publiserer til grenen `data` og leser
  både grenen og `snowfinder-seven.vercel.app/data/latest.json` tilbake. En kjøring som feiler, blir rød i
  Actions, og GitHub sender e-post til den som sist endret arbeidsflyten (NFR-6).
- **Hullet:** stopper kjeden mellom `data-timer.yml` og `data.yml`, blir det ingen kjøring som kan feile. Den
  planlagte reserven i `data.yml` kjører på GitHubs planlegger, som 4. november droppet 283 av rundt 290
  forsøk (kommentaren øverst i `data-timer.yml`). Stillhet ser grønt ut. Ingen leser heller Actions-fanen
  kl. 03.
- **Kilden:** et rundbord i `bmad-party-mode` 2026-11-18 med John, Sally, Winston, Amelia, Murat, Victor,
  Carson og Mary. Aksel spurte om agentene kan drifte nettsiden selv. Rommet skilte mellom tre nivåer:
  1. automatisering uten KI, som er det dere har i dag;
  2. en agent som leser og melder fra med et issue;
  3. en agent som endrer kode og publiserer.

  Aksel valgte nivå 2 samme dag. Nivå 3 er avvist, fordi `main` er produksjon (Vercel publiserer den) og
  hver story-PR skal godkjennes av et annet gruppemedlem.
- **Type:** et nytt krav fra gruppa til driften. Kravene til appen er uendret.

## 2. Hva endringen berører

| Område | Endring |
|---|---|
| PRD | **NFR-6** skrives om. I dag står det at «det trengs ingen egen varslingskanal». Ny tekst: en planlagt agent sjekker siden utenfra og lager et issue. §12 får en ny oppføring. Ingen FR endres. |
| SRS (`SnowFinder-PRD-og-SRS.html`) | Kravet som svarer til NFR-6, får samme tekst, og endringsloggen får en linje. Dokumentet blir versjon 2.5. |
| Epics | Ingen ny story. Overvåkeren er ikke appkode. Den er en instruks og en planlagt økt. NFR-6 i kravinventaret får den nye teksten. |
| Arkitektur | Én ny rad i «Running Locally and Environments» og én ny regel i AD-11 (stillhet overvåkes utenfra). Teksten skrives på engelsk. Ingen ny datakontrakt og ingen ny avhengighet i `package.json`. |
| UX | Ingen endring. |
| Repo | Ny fil `drift/overvaakingsagent.md` med instruksen agenten kjører etter, ordrett. GitHub-etiketten `overvåking`. README får et kort avsnitt «Drift og overvåking». |
| AGENTS.md | En linje under «Where things are» om overvåkeren og at den aldri skriver kode. Endres gjennom `bmad-project-context`, ikke i denne PR-en. |
| Planen | `fremdriftsplan.md`, «Hvor er vi nå?». Ingen frister flyttes. |
| Nøkler og tjenester | Ingen nøkler i repoet (NFR-5 holder). Agenten kjører som en planlagt Claude-økt på Aksels konto, med GitHub-tilgang gjennom Claude sin GitHub-app. Den er et driftsverktøy utenfor produktet, på samme måte som Vercel-prosjektet Aksel eier. Avviket fra regelen om tjenester som krever konto er derfor vedtatt her. |

## 3. Anbefalt løsning: planlagt Claude-agent som bare leser og melder fra

### Valgene (Aksel 2026-11-18)

| Spørsmål | Valgt | Forkastet |
|---|---|---|
| Hvor kjører overvåkeren? | **En planlagt Claude-økt** («routine» i Claude Code) som kjører på Anthropics maskiner, uavhengig av GitHub Actions. | **En Actions-jobb uten KI:** 30 linjer YAML, gratis og forutsigbar, men på den samme planleggeren som droppet kjøringene 4. november. Den kan tie akkurat når kjeden har stoppet. **Begge:** mest dekning, men to ting å vedlikeholde før 28. november. |
| Hvem sin konto? | **Aksels**, som også eier Vercel-prosjektet. | Et annet gruppemedlem. |
| Når lages et issue om alder? | **Når dataene er over 2 timer gamle.** Det gir en time å rette før brukerne ser «utdatert» ved 3 timer (NFR-3). Normal alder er rundt én time. | 3 timer (gruppa varsles samtidig med brukerne), og 90 minutter (grensen fra Story 1.11g, som ble svekket 14. november og gir falske alarmer). |
| Når settes den i drift? | **Før kodefrysen 28. november**, så den har drift å vise på demoen og i sluttrapporten. | Bare som «videre arbeid» i sluttrapporten. |
| Hva får agenten gjøre? | **Lese** siden, datafila og kjøringene i Actions, og **lage, kommentere og lukke issues med etiketten `overvåking`**. | Å starte `data.yml` for hånd. Det er trygt fordi kjøringen har en aldersport, men det er en handling og ikke en melding. Det gjør et menneske etter issuet. |

### Hva agenten sjekker

Agenten kjører kl. 06, 12, 18 og 24 norsk tid, altså fire ganger i døgnet, og sjekker:

1. **Siden:** `https://snowfinder-seven.vercel.app/` svarer HTTP 200, og JavaScript-fila siden peker på,
   svarer også HTTP 200.
2. **Datafila:** `https://snowfinder-seven.vercel.app/data/latest.json` svarer HTTP 200 med gyldig JSON, og
   - `mode` er `live`;
   - `steder` har minst 285 steder (95 % av 300, samme grense som publiseringen i AD-2);
   - `report.publisert` er `true`;
   - alderen, altså nå minus `referenceTime`, er under 2 timer.
3. **Kjøringene:** `gh run list` for `data.yml` og `data-timer.yml` for det siste døgnet: når siste grønne
   `data.yml` var, om en `data-timer.yml` venter nå, og hvor mange som feilet.

### Hva agenten skriver

- **Alt i orden og ingen åpne issues:** ingenting.
- **Avvik og ingen åpent issue med etiketten `overvåking`:** ett nytt issue på norsk. Tittelen sier hva
  brukeren ser, for eksempel «Siden viser data fra kl. 02.10 (5 t gamle)». Teksten har tallene fra
  sjekkene, en diagnose og ett konkret neste steg:
  - **Ingen kjøringer de siste 2 timene:** kjeden har stoppet. Start `data.yml` for hånd i Actions.
  - **Kjøringene feiler:** hvilket steg feilet, med et kort utdrag fra loggen.
  - **Kjøringene er grønne, men siden er gammel:** feilen ligger i omskrivingen i `vercel.json`, hos Vercel
    eller i hurtigbufferen.
  - **Siden svarer ikke:** sjekk Vercel-prosjektet.
- **Avvik og et åpent issue finnes:** en kommentar, men bare når diagnosen har endret seg. Gruppa skal få
  ett issue, ikke ett hver sjette time.
- **I orden igjen og et åpent issue finnes:** en kommentar med tidspunktet og tallene, og issuet lukkes.

### Hva agenten aldri gjør

Agenten pusher aldri, lager aldri greiner eller PR-er, merger aldri, endrer aldri filer, starter aldri
arbeidsflyter og endrer ingen innstillinger. GitHub-appen gir bredere tilgang enn bare issues, så dette
forbudet hviler på instruksen og ikke på tilgangen. Det står i instruksen, og det skal stå i sluttrapporten
som en kjent begrensning.

### Innsats, risiko og tid

- **Innsats:** lav. Instruksen, etiketten, README-avsnittet og en planlagt økt. Ingen appkode.
- **Risiko:**
  - Agenten kan feiltolke en situasjon. Konsekvensen er et unødvendig issue eller et issue med feil
    diagnose. Siden påvirkes aldri.
  - Overvåkeren avhenger av Aksels konto og kvote. Stopper den, er situasjonen den samme som i dag, og
    det står som en kjent risiko.
  - Agenten kan ikke se at kartet faktisk tegnes, bare at siden og datafila svarer riktig. Visningen
    dekkes av E2E-testene i CI.
- **Tid:** én kveld, i drift før 28. november.

## 4. Endringene i detalj

### 4.1 PRD (`SnowFinder-PRD.md` og kopien `prd.md`)

**§7.3, NFR-6. GAMMELT:**

> - **NFR-6:** Mislykkede kjøringer og avviste API-svar står i kvalitetsrapporten (NFR-DQ2). En
>   feilet planlagt kjøring vises som rød i Actions-fanen, og GitHub sender e-post til den som sist
>   endret jobben. Gruppa sjekker Actions-fanen fast. Det trengs ingen egen varslingskanal.

**NYTT:**

> - **NFR-6:** Mislykkede kjøringer og avviste API-svar står i kvalitetsrapporten (NFR-DQ2). En
>   feilet planlagt kjøring vises som rød i Actions-fanen, og GitHub sender e-post til den som sist
>   endret jobben. I tillegg sjekker en planlagt agent nettsiden utenfra fire ganger i døgnet,
>   uavhengig av GitHub Actions. Den lager ett issue med etiketten `overvåking` når siden ikke
>   svarer, når datafila har under 95 % av stedene, eller når dataene er over 2 timer gamle, og
>   lukker det når alt er i orden igjen. Agenten leser og melder fra, men endrer aldri kode eller
>   publiserer (`drift/overvaakingsagent.md`). *Begrunnelse:* en kjede som stopper, gir ingen rød
>   kjøring, så bare en sjekk utenfra ser den.

**§12, ny oppføring etter «2026-11-18: beste steder akkurat nå»:**

> ### 2026-11-18: overvåking av nettsiden
>
> - NFR-6 har fått en planlagt agent som sjekker siden utenfra og lager et issue ved avvik. Agenten
>   leser og melder fra, men endrer aldri kode
>   ([sprint-change-proposal-2026-11-18-overvaakingsagent.md](../../project-workspace/planning-artifacts/sprint-change-proposal-2026-11-18-overvaakingsagent.md)).

Frontmatter: `updated: 2026-11-18`. Status forblir `final`.

### 4.2 SRS (`SnowFinder-PRD-og-SRS.html`, versjon 2.5)

- Kravet som svarer til NFR-6, får samme tekst som NFR-6 over. Verifiseringen er I (inspeksjon): et
  testissue laget og lukket av agenten, se §5.
- Endringslogg for versjon 2.5: «NFR-6 har fått en planlagt agent som overvåker nettsiden
  (sprint-change-proposal-2026-11-18-overvaakingsagent.md).»

### 4.3 Epics (`SnowFinder-Epics-og-Stories.md`)

- **Kravinventaret:** NFR-6 får den nye teksten i kortform: «… og en planlagt agent som sjekker siden utenfra
  og lager et issue ved avvik (2026-11-18)».
- Ingen ny story.

### 4.4 Arkitektur (`SnowFinder-Arkitektur.md` og kopien `ARCHITECTURE-SPINE.md`, på engelsk)

**AD-11, ny regel etter «Where reports go»:**

> - **Silence is watched from outside.** *(v8, 2026-11-18)* A stopped chain of `data-timer.yml` and
>   `data.yml` produces no failed run, so a scheduled Claude session outside GitHub Actions checks the
>   site four times a day: the page and its script answer, the data file is `live` with at least 95 %
>   of the locations, and its `referenceTime` is under 2 h old. On a deviation it opens one issue
>   labelled `overvåking`, comments only when the diagnosis changes, and closes it when all is well.
>   It reads and reports only: it never pushes, opens PRs, merges, edits files or starts workflows.
>   Its instructions are versioned in `drift/overvaakingsagent.md`.

**«Running Locally and Environments», ny rad etter Vercel:**

> | Monitoring agent (scheduled Claude session, 06, 12, 18 and 24 Norwegian time) | reads the site, `/data/latest.json` and the runs of `data.yml` and `data-timer.yml`, and opens, comments on or closes one issue labelled `overvåking` | live, read only | Aksel's Claude account with the Claude GitHub app on the repository; no keys in the repository |

Begge kopiene endres i samme commit.

### 4.5 Repo

- **`drift/overvaakingsagent.md`:** instruksen ordrett, med sjekkene, tersklene, diagnosene, reglene for
  issues og forbudslisten fra §3. Den planlagte økten kjører på denne fila, så det som står i repoet, er
  det agenten gjør. Endres instruksen, endres den planlagte økten i samme PR.
- **Etiketten `overvåking`** opprettes i GitHub.
- **README, nytt avsnitt «Drift og overvåking»:** tre setninger om at dataprogrammet kjører hver time, at en
  agent sjekker siden fire ganger i døgnet og lager et issue ved avvik, og hva man gjør når det kommer et
  issue: følg neste steg i issuet.

### 4.6 Plan og logg

- **`fremdriftsplan.md`, «Hvor er vi nå?»:** endringsforslaget er godkjent, og overvåkeren er i drift fra
  datoen den ble satt opp. «Sist oppdatert» settes.
- **`ai-log/logg.md`** får en rad, og promptene legges ordrett i
  `ai-log/prompter/2026-11-18-aksel-overvaakingsagent.md`.

## 5. Overlevering

- **Omfang:** lite. Ingen story og ingen appkode. Gjøres på greinen `docs/overvaakingsagent`:
  1. endringene i §4.1–4.6 i én PR;
  2. etter merge setter Aksel opp den planlagte økten på sin konto med `/schedule`, med instruksen fra
     `drift/overvaakingsagent.md`;
  3. AGENTS.md får linjen sin gjennom `bmad-project-context`.
- **Ferdig når:**
  - PR-en er merget med grønne sjekker. Dette er en `docs/`-PR, så den trenger ikke godkjenning.
  - En **prøvekjøring mot siden slik den er**, uten avvik, lager ingen issue.
  - En **prøvekjøring med grensen satt til 1 minutt** lager ett issue med etiketten `overvåking`. En ny
    kjøring kommenterer ikke, fordi diagnosen er den samme. Med grensen tilbake på 2 timer lukkes issuet
    med en kommentar. Lenken til issuet står i `fremdriftsplan.md`.
  - Den planlagte økten står med kl. 06, 12, 18 og 24, og den første planlagte kjøringen er gått uten feil.

## 6. Godkjenning

Godkjent av Aksel 2026-11-18 («ja godkjent , gjør endringene og lag pr»), med valgene i §3 slik Aksel gjorde dem samme dag.
