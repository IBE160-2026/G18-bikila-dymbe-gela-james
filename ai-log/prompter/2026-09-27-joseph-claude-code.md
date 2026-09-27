# 2026-09-27: MoSCoW og MVP eksplisitt i produktbriefen

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Sonnet 5), uten BMad-agent
**Fase:** Oppstart
**Resultat:** `project-phase-folders/1-Oppstartsfasen/SnowFinder-Produktbrief.md` og
`project-workspace/planning-artifacts/product-brief.md` oppdatert i seksjonen
"Scope for Version 1"

## Prompter

### 1
> Kunne du oppdatere produktbriefen slik at den gjenspeiler at vi bruker MoSCoW metoden selv om
> vi gjør det ekplisitt i briefen ?

**Svar (kort):** La til en setning som navngir MoSCoW-metoden, og merket radene i
prioriteringstabellen med Must have/Should have/Won't have.
**Hva vi gjorde med det:** Avvist i neste prompt, se under.

### 2
> la være, se bort fra det ikke push ikke commiter den

**Svar (kort):** Reverterte endringen med `git checkout --` på begge filene.
**Hva vi gjorde med det:** Endringen ble forkastet, ingen commit.

### 3
> ut fra det du vet om produkt briefen tror du at vi bor nevne mvp og moscow eksplitt ?

**Svar (kort):** Anbefalte å nevne begge, kort begrunnet: briefen bruker allerede strukturen, og
det er billig å navngi metodene eksplisitt i en kursoppgave der metodebruk vurderes.
**Hva vi gjorde med det:** Brukt som grunnlag for neste prompt.

### 4
> hvor anbefaller at vi legge disse ?

**Svar (kort):** Anbefalte å samle begge i "Scope for Version 1": MoSCoW-setningen før tabellen,
MVP-setningen i avsnittet rett under.
**Hva vi gjorde med det:** Brukt.

### 5
> gjør det her og vis meg her før du pusher

**Svar (kort):** Gjorde endringen i begge filene og viste diffen før commit.
**Hva vi gjorde med det:** Godkjent av Joseph.

### 6
> push og commiter til git

**Svar (kort):** Committet endringen, rebaset mot `origin/main` (to nye commits fra andre i
gruppa) og pushet.
**Hva vi gjorde med det:** Brukt. Commit `dc3323e` på `main`.
