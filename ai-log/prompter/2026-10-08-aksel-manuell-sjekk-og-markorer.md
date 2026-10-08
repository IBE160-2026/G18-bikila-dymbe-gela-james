# 2026-10-08: Manuell sjekk av kart og liste, og markører etter zoom

**Hvem:** Aksel
**Verktøy / agent:** Claude Code (Opus 5.5). Playwright-Chromium styrte appen i `npm run dev`. `bmad-build` i oneshot-rute, med Blind Hunter som underagent.
**Fase:** Gjennomføring
**Resultat:** [`spec-1-7b-markorer-etter-zoom.md`](../../project-workspace/implementation-artifacts/spec-1-7b-markorer-etter-zoom.md), `src/components/kartMarkor.ts` og `src/components/KartVisning.tsx`.

## Prompter

### 1
> kjør npm run dev og sjekk dem

**Svar (kort):** Claude startet dev-serveren og gikk gjennom appen i Chromium med live-data for 300 steder, på desktop og mobil. Kart, tooltip, liste, avstandssortering, stedsside og «Tilbake» virket, og det kom ingen konsollfeil. Men 28 px-markørene overlappet på landsnivå i Sør-Norge, så de fleste stedene ikke kunne klikkes.

**Valg (Aksel):** «Mindre markører ut zoomet» (framfor klynging, som krever en ny avhengighet, eller å la det være).

**Hva vi gjorde med det:**
- Markørene er nå 10 px på landsnivå og vokser til 28 px fra zoom 8. Ufullstendige markører beholder en tydelig stiplet kant.
- Ny sjekk i Chromium etter endringen: stedene i Sør-Norge kan skilles fra hverandre, og markørene vokser ved zoom.
- Avviket fra DESIGN.md og trykkflaten på mobil er notert i `deferred-work.md`.
