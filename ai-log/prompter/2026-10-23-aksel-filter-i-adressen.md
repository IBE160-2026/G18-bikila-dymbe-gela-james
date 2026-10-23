# 2026-10-23: Filteret i nettadressen (Story 3.2)

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). `bmad-build` i dispatch-ruten, med gjennomgang i tre lag (Blind Hunter, Edge Case Hunter og Verification Gap) i underagenter.
**Fase:** Gjennomføring
**Resultat:** [`spec-3-2-del-og-gjenapne-filtrert-sok.md`](../../project-workspace/implementation-artifacts/spec-3-2-del-og-gjenapne-filtrert-sok.md).

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
