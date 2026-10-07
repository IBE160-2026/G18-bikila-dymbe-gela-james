# G18 — Agentic Programming (Kveldstid over teams)

Gruppeprosjekt i **IBE160 Programmering med KI** ved Høgskolen i Molde, høsten 2026 (15 studiepoeng).

Repoet inneholder gruppens applikasjon og dokumentasjon av utvikling, testing og kvalitetssikring med KI.

## Medlemmer

- Sena G Bikila
- Aksel Dymbe
- Kelly B Gela
- Joseph James

## Kom i gang

Krever Node 24, eller Node 26 eller nyere (Node 25 støttes ikke).

```sh
npm ci              # installer avhengighetene fra package-lock.json
npm run dev         # start utviklingsserveren
npm run lint        # kjør ESLint
npm run typecheck   # sjekk typene
npm test            # kjør enhetstestene
npm run build       # bygg produksjonsversjonen
```

### Sjekk før push

`npm ci` (eller `npm install`) slår på en git-hook, `.githooks/pre-push`, som kjøres hver gang du pusher:

- Push direkte til `main` avvises. Lag en grein og en pull request.
- Har du endringer som ikke er committet, stoppes pushen, slik at sjekkene tester det du faktisk pusher.
- `lint`, `typecheck`, `test` og `build` kjøres, og pushen stoppes hvis én av dem feiler.

Klonet du repoet før hooken kom, slår du den på med `npm run prepare`. Sjekk at den er aktiv med `git config core.hooksPath`; svaret skal være `.githooks`.

Hooken er en lokal erstatning for CI til GitHub Actions er slått på for repoet. Den er ikke helt det samme:
- den kjører på din maskin og Node-versjon;
- den tester ikke den flettede tilstanden i pull requesten.

Bare i et nødstilfelle med feilende sjekker kan den hoppes over med `git push --no-verify`. Skriv i så fall i pull requesten hvorfor. Bruk det aldri for å pushe til `main`.

## Dokumentasjon

Prosjektdokumentasjonen ligger i [`project-phase-folders/`](project-phase-folders/), organisert
etter oppstarts-, planleggings-, gjennomførings- og avslutningsfasen. `project-workspace/` er
BMAD-verktøyets arbeidsmappe, ikke gruppens leveranse — se
[`project-phase-folders/README.md`](project-phase-folders/README.md) for hva som ligger hvor.
[`AGENTS.md`](AGENTS.md) inneholder reglene KI-agentene følger i repoet.

## Følg fremdriften

- [`fremdriftsplan.md`](project-phase-folders/2-Planleggingsfasen/fremdriftsplan.md) viser hvor
  vi er, hva som kommer, og hvilken BMad-agent vi bruker i hvert steg.
- [`ai-log/prompter/`](ai-log/prompter/) inneholder promptene vi har brukt, ordrett, én fil per
  økt.
