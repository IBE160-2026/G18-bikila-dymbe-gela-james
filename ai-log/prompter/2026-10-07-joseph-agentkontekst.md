# 2026-10-07: Prosjektkontekst for agentene i AGENTS.md

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5)
**Fase:** Gjennomføring
**Resultat:**
- Ny seksjon «Prosjektkontekst for agenter» i [`AGENTS.md`](../../AGENTS.md), utenfor
  `bmad:context`-markørene. Den dekker:
  - sensorveiledningens kriterier;
  - arkitektur, UX, Git-strategi, CI og teststrategi;
  - åpne beslutninger.
- Forslag til hvordan kursets UX-punkter (pålogging, profil, innsjekking, sosial feed,
  arrangementer) dekkes av SnowFinder. Gruppa har ikke vedtatt det.

## Prompter

### 1
> kan du lage en kontekst dokument agentene skal jobbe med når vi ber dem utføre noe aktivitet i dette prosjektet. Her er poegene konteksten skal bygge på :
>
> •Arkitektur •Beskriv (=programmér [men som over - det trenger ikke å være kjørende kode på dette tidspunktet, psudokode eller prosa går greit hvis dere foretrekker det]) den overordnede løsningsarkitekturen. •Teamet skal dokumentere: •Arkitekturstil-valg •Hovedkomponenter •Dataflyt •Ansvarsfordeling mellom komponenter [og dermed potensielt medlemmer i teamet] •Viktige tekniske beslutninger •Arkitekturvalgene skal begrunnes. •UX ["User experience"]og Wireframes [tegninger av brukergrensesnittet] •Lag wireframes eller prototyper av sentrale brukergrensesnitt. •Disse skal minimum dekke: •Pålogging •Profil •Innsjekking •Sosial feed •Arrangementer •Designvalg skal begrunnes ut fra brukernes behov. •Git-strategi •Beskriv hvordan teamet skal samarbeide gjennom versjonskontroll. •Beskriv blant annet (etter behov): •Arbeidsflyt •Branching (om det brukes) •Pull requests •Kodegjennomganger •Strategi for kontinuerlig integrasjon •Beskriv hvordan kode skal bygges og verifiseres automatisk. •Minst følgende skal omtales: •Automatiske bygg •Automatiske tester •Kvalitetskontroller •Leveransepipeline •Teststrategi •Beskriv hvordan kvalitet skal sikres gjennom prosjektet. •Inkluder: •Enhetstester •Integrasjonstester •Akseptansetester •Testansvar •Kvalitetskriterier

**Svar (kort):** Claude fant en motsigelse. Kurset ber om wireframes for pålogging, profil,
innsjekking, sosial feed og arrangementer, mens PRD-en sier at v1 ikke har kontoer eller
sosiale funksjoner (PRD §2.2, §5). Claude spurte hvordan det skulle løses, og hvor dokumentet
skulle ligge.

**Hva vi gjorde med det:** Svarte på spørsmålene (prompt 2).

### 2
> (svar på spørsmål om kurskrav) Ta utgangspunkt i prosjektbriefen og SRS men vi er apne til forslag. Ta også utgangspunkt i kontekst dokument vi har bedt deg å lage nå. Her er sensorveiledning som du skal også ta utgangspunkt i når du lage kontekstdokument: [hele sensorveiledningen for del 1, IBE160 høst 2026, limt inn]
>
> (svar på plassering) Alt i AGENTS.md

**Svar (kort):** Kontekstseksjonen ble skrevet i AGENTS.md. Prosjektet har ingen egen SRS, så
PRD-en ble brukt som kravdokument. UX-punktene ble dekket som et forslag som knytter hvert
kurspunkt til nærmeste skjerm i SnowFinder, med begrunnelse.

**Hva vi gjorde med det:**
- Forslaget om å legge til kontoer og sosiale funksjoner i produktet ble ikke fulgt. Det ville
  krevd `bmad-correct-course` og endret PRD, UX, arkitektur og epics. Det ligger i stedet som
  en åpen beslutning for gruppa.
- Fordeling av ansvar på personer ble ikke laget av KI. Den er lagt igjen til gruppa.
