# 2026-10-07: PRD v2 og oppdatert produktbrief (John)

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5), agent John (`bmad-prd` Update, `bmad-product-brief` Update), underagent for avstemming og rubrikkgjennomgang (Sonnet 5.5)
**Fase:** Gjennomføring
**Resultat:**
- PRD v2: ny FR-30 (demomodus), FR-31 (analyse, Bør ha), NFR-DQ1–3, FR-6 delt i 6a/6b, fasittabeller, §9 delt i A/B/C med SM-9–SM-15. Begge kopier er like.
- Produktbrief: «gjeldende versjon»-linje, «What Makes This Different», kortere arkitektur og pipeline, demomodus i Må ha, suksesskriterier med verifiseringskolonne.

## Prompter

### 1
> vi går for A

**Svar (kort):** Endringsforslaget ble pushet som PR #8. John oppdaterte PRD-en etter P1–P9 i det godkjente forslaget.

**Hva vi gjorde med det:**
- En underagent avstemte PRD-en mot forslaget og faglærers tilbakemelding, og gikk gjennom PRD-rubrikken (`review-v2.md`). Den fant 5 høye, 10 middels og 8 lave funn.
- Alle høye og middels funn ble rettet. Det viktigste: demodata med fast klokke, så dataalder ikke gjør demoen ubrukelig etter noen timer.
- Beste skivindu ble beholdt som Bør ha i stedet for å flyttes til Må ha, i tråd med forslaget.
- Den formelle språkvaskrunden (`bmad-review` structure/prose) ble bevisst hoppet over.
- For briefen viste et nettsøk at seNorge.no allerede viser nasjonalt simulert nysnø. Påstanden om at «ingen tjeneste» finnes ble derfor nyansert, i stedet for å påstå et fortrinn vi ikke har.
