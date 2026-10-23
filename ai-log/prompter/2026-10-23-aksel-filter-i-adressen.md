# 2026-10-23: Filteret i nettadressen (Story 3.2)

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-build` i dispatch-ruten, med gjennomgang i tre lag (Blind Hunter, Edge Case Hunter og Verification Gap) i underagenter.
**Fase:** Gjennomføring
**Resultat:** [`spec-3-2-del-og-gjenapne-filtrert-sok.md`](../../project-workspace/implementation-artifacts/spec-3-2-del-og-gjenapne-filtrert-sok.md) (PR #49) og [`spec-3-2b-filter-i-stedsadressen.md`](../../project-workspace/implementation-artifacts/spec-3-2b-filter-i-stedsadressen.md).

## Prompter

### 1
> lærer har ikke svart meg enda. fortsett der vi slapp

**Svar (kort):** Claude fortsatte med Story 3.2. Disse valgene tok Claude selv, fordi de følger vanlig praksis, og de står i spec-en:
- **Parametre:** korte navn (`nysno`, `vind`, `temp`) i fast rekkefølge.
- **Ugyldige verdier** behandles som «Alle».
- **Historikk:** slider-endringer erstatter adressen i stedet for å lage nye steg.
- **Veksleren** mellom kart og liste beholder filteret, mens «SnowFinder» gir et kart uten filter.
- **Sortering:** «Avstand» lagres ikke, så en delt lenke ikke ber mottakeren om posisjon.

Aksel ga lov til å merge i økten. Spec-en ble større enn anbefalt, og Aksel valgte å beholde den samlet.

**Hva vi gjorde med det:**
- Filter, visning og sortering ligger i adressen, så et søk kan deles, og Tilbake fra stedssiden beholder filteret. Det retter det utsatte punktet fra 3.1.
- Gjennomgangen fant at en ny meny-nøkkel lot ☰-menyen stå åpen etter «SnowFinder» fra et filtrert kart. Nøkkelen ble satt tilbake, så menyen lukkes også når man flytter en slider.
- Adressekontrakten står nå i arkitekturen (AD-12), i begge kopiene.

### 2
> rett feilene eller usikkerheten før du går videre til story 3.3

**Svar (kort):** Claude listet fire åpne punkter og spurte hvilke som skulle med:
- filter og sted i adressen (UJ-1);
- usikkerheten om hvilket døgn NVE-verdien gjelder;
- ustabile tester lokalt;
- små inkonsistenser i 3.2.

**Valg:** Bare «Filter + sted i adressen».

**Hva vi gjorde med det:**
- Stedssidens adresse bærer nå søket den ble åpnet fra, for eksempel `/sted/gaustatoppen?visning=liste&nysno=2&temp=0`. En delt stedslenke og «Tilbake» gir derfor samme søk. «Gå til kartet» på «Fant ikke stedet» beholder også søket.
- Adressen ryddes når stedssiden lastes, som på Utforsk.

### 3
> på disse punktene ta en avgjørelse for det du synes er beste løsning hvilket døgn NVE-verdien gjelder; tunge tester som av og til går over tidsgrensen lokalt (i CI har de vært grønne); to små inkonsistenser fra 3.2.

**Svar (kort):** Claude tok tre avgjørelser:
- **NVE-døgnet:** Ifølge seNorge2 (MET) gjelder en verdi stemplet D kl. 06 UTC døgnet som endte da. Koden er riktig og ble ikke endret. Tolkningen er dokumentert, og spørsmålet om norsk dato er lukket.
- **Tunge tester:** De har nå én felles tidsgrense på 15 s.
- **Inkonsistensene fra 3.2:** Et gjentatt `visning` gir standard. At «Avstand» kan bli stående ved Tilbake/Fram, godtas og er forklart i koden.

**Hva vi gjorde med det:** Spec: [`spec-rydd-apne-punkter.md`](../../project-workspace/implementation-artifacts/spec-rydd-apne-punkter.md).

### 4
> gå videre

**Svar (kort):** Claude bygde Story 3.3 og spurte om to valg. Aksel valgte begge anbefalingene:
- **Forslaget ved null treff** er den nærmeste slider-verdien som gir treff, for kravet som da gir flest treff.
- **Forslaget er en knapp**, «Bruk forslaget».

**Hva vi gjorde med det:**
- Panelet viser antall treff hele tiden, og én levende region leser det opp.
- Ved null treff viser et banner forslaget, «Bruk forslaget» og «Nullstill».
- Regelen er låst i fasittabellen.
- FR-14 i PRD-en er presisert i begge kopiene. Der stod «hvis fjernet», mens storyen og eksempelet sier «lempet».
- Spec: [`spec-3-3-treff-og-null-treff.md`](../../project-workspace/implementation-artifacts/spec-3-3-treff-og-null-treff.md).
