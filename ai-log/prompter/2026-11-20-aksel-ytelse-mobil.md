# 2026-11-20: ytelse på mobil (SM-1 og SM-12)

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` med en implementeringsagent og tre agenter som gikk gjennom koden
**Fase:** Gjennomføring
**Resultat:** SM-1 holder etter tiltak A (99,4 %). SM-12 holder ikke (rundt 5 s), og det finnes et utkast til avvik.
Tiltak B er bygget, målt og fjernet.

## Prompter

### 1
> Jeg tar mobilproblemene før kodefrysen 28.11. [...] STEG 1 – Kartlegg (ikke endre kode ennå) [...] STEG 2 – Rett
> ytelsen [...] STEG 3 – Kartet på små telefoner (bare forslag) [...]

**Svar (kort):** Ny grunnmåling mot den publiserte siden: SM-12 median 7,5 s og SM-1 89 %. Fire tiltak ble foreslått:
- A: bare endrede markører;
- B: parallell lasting;
- C: zod/mini;
- D: canvas.

Claude anbefalte A og B, og vurderte at SM-12 neppe når 3 s.
**Hva vi gjorde med det:** Aksel valgte A og B.

### 2
Valg i dialog: målemetoden er et lokalt produksjonsbygg, fordi forhåndsvisningene på Vercel krever innlogging.

### 3
> Godkjent. Én endring: be Kelly om review i stedet for Sena [...] Ta med i PR-en at SM-12 i tillegg skal måles på en ekte telefon.

**Svar (kort):** Spesifikasjonen ble oppdatert. Claude påpekte at Kellys kontoer heller ikke har noen synlig review.
**Hva vi gjorde med det:** brukt.

### 4
> To ting: (1) Snu rekkefølgen på review: Joseph først, Kelly i tillegg. [...] (2) Kjør 10–20 målinger per variant i
> stedet for 5, og forklar hvorfor SM-1 er dårligere lokalt (80 %) enn på den publiserte siden (89 %) når SM-12 er bedre lokalt.

**Svar (kort):** Claude la fram hypoteser om nett mot CPU, støy og ulike data, og la opp til 10 runder der variantene
måles etter tur.
**Hva vi gjorde med det:** brukt.

### 5
> Lås datagrunnlaget: bruk samme kopi av latest.json for alle tre lokale varianter [...]

**Svar (kort):** Alle tre lokale varianter bruker kopien med data fra kl. 09.40. Det står i resultatet at den publiserte
siden bruker live-data.
**Hva vi gjorde med det:** brukt.

### 6
Valg i dialog: «Fjern B, behold A (Anbefalt)», etter at B ikke ga målbar effekt (4896 ms mot 4996 ms).

**Svar (kort):** B er fjernet med en revert. To funn fra gjennomgangen ble rettet, og E2E viser 176 grønne tester.
**Hva vi gjorde med det:** brukt.
