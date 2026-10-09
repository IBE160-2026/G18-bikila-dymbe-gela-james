# Sprint Change Proposal: NVE-nedetid og mørk modus

**Dato:** 2026-10-09
**Utløst av:** revisjonen av alt arbeid 2026-10-09
**Modus:** batch
**Omfang:** Minor. Bare dokumenter og én kodekommentar endres.
**Godkjent:** Aksel lot Claude ta de to valgene («rett de to valgene», 2026-10-09).

## 1. Problem

Revisjonen fant to steder der planen beskriver noe annet enn koden.

1. **NVE-nedetid.** FR-6a i PRD-en sier: «Når en datakilde feiler, publiseres ingen ny batch.» Koden (`scripts/pipeline/publish.ts`, `validShare`) teller bare MET mot 95 %-terskelen. Når NVE feiler, publiseres batchen med tomt NVE-felt. Testen `scripts/pipeline/run.test.ts:191` viser dette: NVE feiler for alle steder, og dataene publiseres med `nveNysnoSisteDognMm: null`. Produktbriefen og NFR-4 sier det samme som FR-6a.
2. **Mørk modus.** DESIGN.md lover at appen følger systemets mørke modus. Den er ikke bygget. Tokenene finnes, men ingen CSS bruker dem, og kommentaren i `src/styles/tokens.css` sier fortsatt at funksjonen er utsatt til «den første storyen med ekte UI».

## 2. Konsekvenser

| Område | Konsekvens |
|---|---|
| Epics og stories | Ingen story endres. Story 1.5 (publisering) og 1.6 (nedetid, Bør ha) er i tråd med den nye teksten. |
| PRD | FR-6a og NFR-4 skrives om. |
| Produktbrief | Linjene om robusthet og kvalitetsterskel presiseres. |
| Arkitektur | Avsnittet om terskel og delvise feil (AD-11) presiseres. |
| UX (DESIGN.md) | Mørk modus merkes «Ikke i v1». `-dark`-tokenene beholdes. |
| Kode | Bare kommentaren i `src/styles/tokens.css`. Ingen endring i oppførselen. |

## 3. Anbefalt løsning: direkte justering

1. **NVE er tilleggsdata.** NVE-nysnø inngår ikke i SnowScore. Den vises bare på stedssiden. Hvis NVE-nedetid stoppet publiseringen, ville alle steder vise gamle poengsummer, selv om MET-dataene, som poengsummene bygger på, er ferske. Kravet endres derfor så det passer koden, og koden beholdes.
2. **Mørk modus er «Ikke i v1».** Faglærer har rådet oss til å holde omfanget lite. Mørk modus krever egne kontrastsjekker for alle flater og SnowScore-trinn, og axe-tester i begge moduser. Tokenene beholdes, så den kan bygges senere uten nytt designarbeid.

Risikoen er lav. Ingen kode som påvirker oppførselen endres, og de fire sjekkene og E2E skal fortsatt være grønne.

## 4. Endringer

Alle planleggingsdokumentene endres i begge kopiene i samme commit (AGENTS.md).

### PRD: FR-6a

GAMMELT:
> - Når en datakilde feiler, publiseres ingen ny batch, og klienten viser forrige gyldige batch (følger av FR-5). Verifiseres ved å simulere nedetid i test (NFR-4).

NYTT:
> - Når MET feiler for mer enn 5 % av stedene, publiseres ingen ny batch, og klienten viser forrige gyldige batch (følger av FR-5). Verifiseres ved å simulere nedetid i test (NFR-4).
> - *(v4, 2026-10-09)* NVE er tilleggsdata. NVE-nysnø inngår ikke i SnowScore og teller ikke mot 95 %-terskelen. Når NVE feiler, publiseres batchen likevel: NVE-feltet er tomt («–» på stedssiden), og avvisningene står i kvalitetsrapporten. Å stoppe hele tjenesten fordi en tilleggsverdi mangler, ville gitt brukerne gamle poengsummer uten å gjøre dem bedre.

### PRD: NFR-4

GAMMELT:
> Tjenesten fungerer med siste gyldige data når én datakilde (MET eller NVE) er utilgjengelig — verifisert ved å simulere nedetid i test. Validerer FR-6a.

NYTT:
> Tjenesten fungerer med siste gyldige data når MET er utilgjengelig, og publiserer uten NVE-verdier når NVE er utilgjengelig *(presisert v4, 2026-10-09)* — verifisert ved å simulere nedetid i test. Validerer FR-6a.

### Produktbrief

- «Resultatet publiseres som én datafil bare hvis minst 95 % av stedene har gyldige data.» blir «… har gyldige data fra MET (NVE-nysnø er tilleggsdata).»
- «Faller MET eller NVE ut, fungerer SnowFinder videre med siste gyldige data.» blir «Faller MET ut, fungerer SnowFinder videre med siste gyldige data. Faller NVE ut, publiseres dataene uten NVE-nysnø, som ikke inngår i SnowScore.»
- «en kjøring publiseres bare når minst 95 % av stedene har gyldige data» blir «… gyldige data fra MET».

### Arkitektur (AD-11, «Threshold and partial failures»)

«The 95 % threshold counts only rejected or missing responses» blir «The 95 % threshold counts only rejected or missing MET responses. NVE is supplementary (not part of SnowScore): an NVE failure leaves `nveNysnoSisteDognMm` null and is recorded in the report without blocking publication (FR-6a, v4).»

### DESIGN.md

- `description`: «mørk modus støttet for kveldsplanlegging» blir «mørk modus er «Ikke i v1» (tokenene står klare)».
- Avsnittet om lys og mørk modus: «Mørk modus følger systeminnstilling for kveldsplanlegging hjemme.» blir «Mørk modus er «Ikke i v1» (2026-10-09, revisjonen): den krever egne kontrastsjekker og axe-tester i begge moduser. `-dark`-tokenene under står klare for en senere versjon.»

### Kode: `src/styles/tokens.css`

Kommentaren «Dark-mode switching is deferred to the first story with real UI, so the -dark tokens are plain variables.» blir «Dark mode is «Ikke i v1» (DESIGN.md); the -dark tokens are kept for a later version and are not used yet.»

## 5. Overlevering

- **Omfang:** Minor. Claude legger inn endringene direkte på grenen `docs/nve-og-mork-modus`, som leveres som PR og merges bare når `gh pr checks` er grønn.
- **Ferdig når:**
  - begge kopiene av hvert dokument er like;
  - lint, typecheck, test og build er grønne;
  - CI og E2E er grønne på GitHub.
- **Oppfølging:** Revisjonens øvrige funn i dataprogrammet (en kjøring der alle steder er ufullstendige kan erstatte god data, ingen grense for hvor ofte MET kalles, gamle NVE-verdier) bygges som egne retting-PR-er med `bmad-build`.
