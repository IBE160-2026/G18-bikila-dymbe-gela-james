# 2026-10-07: Arkitektur v3 (Winston)

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5), agent Winston (`bmad-architecture` Update) med tre gjennomgangsagenter (Sonnet 5.5): rubrikk, reality-check og adversary
**Fase:** Planlegging
**Resultat:** Arkitekturspinen v3 er markert `final`. Begge kopiene er like.
- **Nye regler:**
  - AD-10: dataport med Supabase- og demo-adapter, demoklokke og statisk bryter;
  - AD-11: `pipeline_runs` med én rad per kjøring, også ved feil, og sporbarhet;
  - AD-12: Zod-kontrakter for port-data, filterparametre og fasittabeller.
- **Endrede regler:** AD-1, AD-2, AD-6 og AD-7.
- **Nye seksjoner:** «Tables and Owners», «Running Locally» og «Environments».

## Prompter

### 1
> kjør på

(fortsett med neste steg i overleveringen etter at Story 1.1 var pushet)

**Svar (kort):** Winston la de godkjente beslutningene (A1–A4) inn i memloggen og spinen. Lint gikk grønt. Tre uavhengige gjennomganger fant reelle hull, blant annet at en mislykket kjøring ikke la igjen noen kvalitetsrad, og at dataformene mellom demo og database ikke hadde noen eier.

**Hva vi gjorde med det:**
- De fleste funnene ble rettet. Triagen står i `reviews/triage.md`.
- Ett funn ble avvist: «mangler package.json». Gjennomgangen leste en grein uten Story 1.1-koden.
- To risikoer ble gjort til åpne spørsmål som skal måles i Story 1.3, i stedet for å påstås løst:
  - om Deno kan importere `shared/`;
  - om én kjøring for ~300 steder holder seg innenfor Supabase sin tidsgrense.

  Passer det ikke, går køstyrte puljer tilbake til Må ha via `bmad-correct-course`.
