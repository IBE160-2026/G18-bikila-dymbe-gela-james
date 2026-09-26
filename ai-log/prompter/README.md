# Prompter

Fullstendig ordrett logg over promptene gruppen har skrevet til KI-verktøy og BMad-agenter,
slik at foreleser kan se nøyaktig hva vi skrev for å få fram dokumentene og nettsiden.

[`../logg.md`](../logg.md) oppsummerer de viktigste KI-bidragene. Denne mappen inneholder
selve promptene.

## Én fil per økt

Filnavn: `YYYY-MM-DD-fornavn-agent.md`, for eksempel `2026-09-28-sena-john-prd.md`.
Hvis økten ikke brukte en BMad-agent, skriv verktøyet i stedet, for eksempel
`2026-09-26-aksel-claude-code.md`.

Lim inne promptene ordrett. Ikke rett skrivefeil eller omformuler, siden poenget er å vise hva
vi faktisk skrev. KI-ens svar trenger ikke kopieres i sin helhet. Skriv heller et kort
sammendrag av hva svaret ga og hva vi gjorde med det.

## Tips: eksporter hele samtalen

I Claude Code lagrer `/export` hele samtalen til en fil. Den kan legges i denne mappen i stedet
for å kopiere promptene for hånd. Fjern eventuelle personopplysninger og hemmelige nøkler før
filen committes.

## Mal

```markdown
# YYYY-MM-DD: kort tittel

**Hvem:**
**Verktøy / agent:** (f.eks. Claude Code, BMad-agent John)
**Fase:** Oppstart / Planlegging / Gjennomføring / Avslutning
**Resultat:** (hvilke filer eller beslutninger økten førte til)

## Prompter

### 1
> ordrett prompt

**Svar (kort):**
**Hva vi gjorde med det:** brukt / endret / avvist, og hvorfor
```
