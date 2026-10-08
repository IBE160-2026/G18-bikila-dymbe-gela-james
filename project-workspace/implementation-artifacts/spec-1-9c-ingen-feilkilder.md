---
title: 'Story 1.9c: Fjern de siste feilkildene i dataflyt og tom tilstand'
type: 'bugfix'
created: '2026-10-08'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/spec-1-9b-stedsside-fullfort.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Aksel ba om at også de fire avviste funnene fra 1.9b-gjennomgangen skulle rettes, så de ikke blir feilkilder (2026-10-08). To av dem var rene prosesspunkter som allerede var gjort: specen ble ferdigstilt, og KI-loggen ble skrevet. De to andre var reelle svakheter:
- **#12:** alderen ble regnet i hver `useSteder()`-instans med egen timer. Det holdt bare så lenge `App` var eneste kaller.
- **#10:** den tomme tilstanden hadde `role="status"` på innhold som vises fra start. Det leses ofte ikke opp. Kart/liste-veksleren ble også vist selv om det ikke var noe å veksle mellom.

**Approach:**
- `useSteder()` leser fra én felles lagring (`createStederStore` + `useSyncExternalStore`). Lagringen laster fila én gang, bruker aldersgrensene én gang og, for live-data, sjekker dem hvert minutt og når fanen vises igjen. Timeren stopper når siste lytter forsvinner.
- Utforsk har en statusregion som alltid finnes, så endringer leses opp. Den tomme tilstanden er en egen seksjon med overskriften «Ingen ferske data», tekst og knapp, og veksleren skjules når listen er tom.

</frozen-after-approval>

## Implementation Notes

- `src/hooks/useSteder.ts`: `createStederStore(loadFn)` gir `subscribe` og `getSnapshot`. `useSteder()` er nå én linje med `useSyncExternalStore`. `createSharedLoader` er fjernet (død kode). `medFerskhet`, `oppdaterFerskhet` og `trengerFerskhetssjekk` er uendret.
- `src/pages/Utforsk.tsx`: statusregionen er en `p.visually-hidden[role=status]` som alltid er der. Tom tilstand vises som `section` med `h2#tom-overskrift`, uten `VisningVeksler`.
- **Tester:**
  - lagringen: én lasting og samme snapshot for alle lyttere; live sjekkes hvert minutt og varsler; demo starter aldri en timer; timeren stoppes når siste lytter går;
  - App-testen for tom tilstand: overskrift og statusregion, ingen veksler;
  - `liste.spec.ts` avgrenser nå statuslinjen til `.liste-status`, fordi det nå finnes to statusregioner.
- **Verifisert:**
  - lint, typecheck, test (304), build og E2E (12, to kjøringer) er grønne;
  - Chromium med låst klokke: utdatert etter 15 min, merket følger til stedssiden og tilbake, og etter over 12 t vises tom tilstand med overskrift og opplest status, uten veksler og uten konsollfeil.
- Etter gjennomgangen:
  - Statusregionen er flyttet til `AppView`, finnes fra første tegning (også under lasting) og sier kort «Ingen ferske data» (`statusMelding`). Den leses dermed opp også ved første lasting, og teksten står ikke to ganger.
  - Lagringen gjør en avvist lasting om til feilvisningen.
  - Kommentarene er oppdatert, og `h2`/`p` i den tomme tilstanden har marger fra tokens.
  - Nye tester:
    - lagringen: ny lytter starter timeren igjen, ingen varsel når ingenting endres, sjekk ved `visibilitychange` og en avvist lasting;
    - `tests/e2e/tom.spec.ts`: første lasting med for gamle live-data (overskrift, knapp, ingen veksler, status, axe) og åpen fane som går fra «Utdatert» til tom tilstand;
    - `liste.spec.ts` bruker igjen `getByRole('status')`, filtrert på tekst.
  - Verifisert: lint, typecheck, test (308), build og E2E (14, to kjøringer) er grønne.

## Review Triage Log

Blind Hunter (oneshot), 10 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Tom tilstand leses ikke opp ved første lasting | medium | patch | Statusregionen ligger nå i `AppView` og finnes fra første tegning. Det er testet i E2E. |
| 2 | En avvist lasting gir evig skjelett | medium | patch | `.catch` gir feilvisningen. Det er testet. |
| 3 | Lagringen mangler tester for synlighet, ny lytter, «ingen endring» og avbrutt lasting | medium | patch | De tre første er lagt til. Avbrutt lasting dekkes av testen for ny lytter. |
| 4 | Ingen E2E for tom tilstand | medium | patch | `tom.spec.ts` dekker både første lasting og åpen fane. |
| 5 | Sporingen mangler | false | avvist | Den skrives ved leveringen. |
| 6 | Teksten står to ganger | low | patch | Statusregionen sier nå bare «Ingen ferske data». |
| 7 | `.liste-status` gir ikke rolletest | low | patch | Testen bruker `getByRole('status')`, filtrert på tekst. |
| 8 | To utdaterte kommentarer | low | patch | Oppdatert. |
| 9 | `h2` i den tomme tilstanden har ingen stil | low | patch | Margin fra tokens. |
| 10 | Feil `type` og tom `context` i specen | low | patch | Rettet til `bugfix`, med lenke til 1.9b. |
