---
title: 'Story 1.11e: Publiser på Vercel i stedet for GitHub Pages'
type: 'feature'
created: '2026-11-01'
status: 'done'
baseline_commit: '23779e178ef1f2f8a67e713c531c00a21f715483'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Faglærer har slått av GitHub Pages, og Vercel er eneste publiseringsløsning emnet støtter. `data.yml` har Pages-kode som aldri kan kjøre, og Vercel bygger bare når `main` endres, så en app med en fast `latest.json` får aldri ferske data.

**Approach:** Fjern bare Pages-delen av `data.yml`. Timeplanen, dataprogrammet, valideringen, skrivingen til grenen `data` og tilbakelesingen beholdes. Ny `vercel.json` bygger appen uten datafiler og proxer `/data/latest.json` til fila på grenen `data`, så hver timeskjøring når nettsiden uten nytt bygg. Annen funksjonalitet endres ikke (`sprint-change-proposal-2026-11-01-vercel.md`, steg 3).

</frozen-after-approval>

## Implementation Notes

- **Prosjektet:** `snowfinder` på Aksels Hobby-konto, koblet til repoet med `vercel link`, produksjonsgren `main`, ingen miljøvariabler. Ignored Build Step er satt gjennom API-et.
- **Avvik:** Vercel gjorde den første `vercel deploy` til produksjon, uten Aksels godkjenning. Produksjonen er bygget fra arbeidskopien, ikke fra `main`.
- **Prøvd på nettsiden:** kart, liste, stedsside og direkte lenke på desktop og mobil, med 300 steder uten demobanner. `/data/demo.json` gir 404, og `/data/latest.json` svarer `application/json`, så overstyringen av innholdstypen virker.
- **Bevis på ferske data:** `data.yml` for hånd ga `runId` `20261101T211649Z-70320aaa`, og den var på nettsiden 85 s etter at kjøringen var ferdig, uten nytt bygg. Bygget på grenen `data` ble avbrutt av Ignored Build Step.
- **Lokalt:** etterligningen viser at `text/plain` gir en tom app, så overstyringen er nødvendig. To nye tester holder den og direkte lenker på plass.
- `git.deploymentEnabled` er fjernet: grenen `data` har ingen `vercel.json`, og det var Ignored Build Step som stoppet bygget.
- Lesesteget mot nettsiden i `verify` er ikke kjørt på ekte ennå. Det skjer etter merge.
- Plugin og MCP fra Vercels veiledning er ikke lagt til: sikkerhetsregelen i Claude Code stoppet endringen av eget oppsett, og publiseringen trenger dem ikke.

## Spec Change Log

## Review Triage Log

Gjennomgang med Blind Hunter (14 funn).

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | `verify` leser ikke nettsiden | high | patch | Stemmer, og endringsforslaget krever det. Eget steg lagt til. |
| 2 | Testene dekker ikke innholdstypen og direkte lenker | medium | patch | Etterligningen viser at feil type gir en tom app. To tester lagt til. |
| 3 | README sier at Vercel holder fila | medium | patch | Målingen viste `MISS`. Rettet. Kort CDN-cache er utsatt. |
| 4 | `git.deploymentEnabled` virker ikke, og Ignored Build Step er ikke dokumentert | medium | patch | Stemmer. Fjernet, og står i README. |
| 5 | Bevisene mangler i spec-en | low | patch | Ført inn her. |
| 6 | KI-loggen mangler Vercel | medium | patch | Ført inn. |
| 7 | Fremdriftsplanen er utdatert | low | patch | Rettet. |
| 8 | Pages står igjen i `AGENTS.md`, kommentarer og `deferred-work.md` | low | defer | `AGENTS.md` tas i steg 5 via `bmad-project-context`. Kommentarene i `src/` røres ikke, siden annen funksjonalitet ikke skal endres. |
| 9 | README nevner ikke nettsiden ved 60 dager | medium | patch | Rettet. |
| 10 | Feilteksten nevner `npm run dev:demo` på nettsiden | low | avvist | Krever at grenen `data` er borte, og den er varig. |
| 11 | Produksjonen kommer ikke fra `main`, så en annen PR kan ødelegge siden | high | defer | Ingen kodefiks. Står i fremdriftsplanen og PR-beskrivelsen: denne merges først. |
| 12 | Filer i `/assets/` caches ikke | low | defer | Ytelse. Vurderes med NFR-2, ikke i denne endringen. |
| 13 | Ukjente rotfiler svarer 200 med HTML | low | avvist | Appen viser sin egen «Fant ikke siden». |
| 14 | CI kjører ikke byggekommandoen fra `vercel.json` | low | defer | Dekket av tester på teksten, av Vercel på hver PR, og av lesesteget på nettsiden. |
