# Tilbakemelding på product brief

| | |
|---|---|
| **Gruppe** | G18 – G18-bikila-dymbe-gela-james |
| **Product brief** | `project-phase-folders/1-Oppstartsfasen/SnowFinder-Produktbrief.md` (commit `86886d0`) |
| **Tilbakemelding fra** | Faglærer i IBE160 (utarbeidet med KI-støtte) |
| **Dato** | 2026-10-06 |

Vurderingen gjelder `SnowFinder-Produktbrief.md`, som README peker på som leveransen. Den er identisk med `project-workspace/planning-artifacts/product-brief.md`. Dere har allerede laget PRD, arkitektur, UX, epics og sprintplan, og tilbakemeldingen tar hensyn til det.

## Samlet vurdering

- **Godt utgangspunkt med justeringer.** Gruppen kan gå videre og innarbeide punktene under.

**Det som er bra:**

1. SnowScore er et forbilledlig eksempel på domenelogikk som kan kontrolleres: åpen formel, tre delpoeng, fast omregning (1 mm ≈ 1 cm), regneeksempel som gir 58, og egenskapsbaserte tester som sjekker at poengsummen alltid er 0–100 og at mer snø aldri gir lavere nysnøpoeng. Her kan dere selv avgjøre om KI-ens kode regner riktig.
2. MoSCoW-tabellen skiller tydelig mellom «må ha» (kart, listevisning, stedssider, pipeline, SnowScore med forklaringsside, filter, CI) og «bør ha» (skivindu, kalkulator, snøvarsel, tilbakemelding), og dere sier selv at «bør ha» bygges først når «må ha» er ferdig.
3. Prosessen er svært godt dokumentert: promptlogg, fremdriftsplan, rettinger av briefen i egne commits og en sporbar kjede brief → PRD → arkitektur → stories. Dette er nettopp det kriterium 1 ser etter.

**De viktigste endringene:**

1. Løsningen er bygget rundt Supabase (Postgres, Edge Functions, planlagte jobber), Cloudflare Turnstile og Web Push. Beskriv hvordan sensor kan kjøre appen lokalt etter README uten tilgang til deres Supabase-prosjekt og nøkler, f.eks. med lokal Supabase og ferdige demodata.
2. Omfanget er stort, selv om det er godt prioritert. «Må ha» alene inneholder en timesbasert datapipeline med kø, validering, atomisk publisering og kretsbryter. Vurder å forenkle pipelinen i v1 og flytt mer av robusthetsmaskineriet til «bør ha».
3. Flere suksesskriterier gjelder drift og brukertester (data under 90 minutter gamle, 4 av 5 testbrukere, WCAG 2.1 AA, ytelse på mobil). Skill tydeligere mellom kriterier som testes automatisk og kriterier som er mål for en brukertest, slik at sensor ser hva som faktisk er verifisert.

## Vanskelighetsgrad og gjennomførbarhet

### Vurdert vanskelighetsgrad

- **Vanskelig**

**Sammenlignbart med:** 4) KI-støttet MRP II (vanskelig), særlig når det gjelder mange moduler som henger sammen (datainnhenting, beregning, publisering, kart, filter og varsler). Domenelogikken er enklere enn i MRP fordi dere har definert formelen selv, men integrasjoner, pipeline og drift trekker tydelig opp.

**Begrunnelse:**

| Faktor | Nivå (lav / middels / høy) | Kommentar |
|---|---|---|
| Domenelogikk – hvor mange og hvor kompliserte regler og beregninger må stemme? | Middels | SnowScore, snøandel, beste skivindu (fire dagslystimer, etter snøfall, mørketid) og datafriskhet. Reglene er presise og egendefinerte, så de kan testes, men skivinduet har mange spesialtilfeller. |
| Datamodell – antall entiteter og relasjoner mellom dem | Middels | Seks tabeller (`locations`, `conditions`, `conditions_staging`, `alert_rules`, `feedback`, `api_incidents`) med tidsserier per sted. Overkommelig. |
| Brukere, roller og innlogging | Lav | Ingen brukerkontoer i v1. Et godt valg som forenkler mye. |
| KI-funksjonalitet i appen, f.eks. kall til språkmodell, prompts i koden og håndtering av usikre svar | Lav | Ingen språkmodell i appen; all beregning er deterministisk. KI brukes i utviklingen. |
| Integrasjoner og eksterne tjenester, f.eks. API-er, betaling og e-post | Høy | MET Locationforecast, NVE seNorge, Kartverket, OpenStreetMap, Supabase, Cloudflare Turnstile og Web Push. Hver av dem krever oppsett, vilkår og feilhåndtering. |
| Sanntid, samtidighet eller flere brukere som påvirker hverandre | Middels | Timesbasert køstyrt jobb i puljer, idempotens og blokkering av samtidige kjøringer. Krevende å få riktig og å teste. |
| Filhåndtering, f.eks. opplasting, PDF-lesing og eksport | Lav | Ikke relevant utover byggingen av stedskatalogen. |
| Sikkerhet og personvern | Middels | Row Level Security, Edge Functions, hastighetsbegrensning, push-abonnement og saltet hash. Godt gjennomtenkt, men mye å implementere og teste. |

**Hva vanskelighetsgraden betyr for dere:**

- _Vanskelig:_ Et vanskelig prosjekt gir større mulighet for toppkarakter, men også større risiko. Definer en minimal versjon som sikkert kan bli ferdig, og legg resten i tydelige trinn etterpå. Deres egen «må ha»-liste er et godt utgangspunkt, men den er fortsatt stor; sørg for at kjeden stedskatalog → data → SnowScore → kart/liste → stedsside → filter virker stabilt før noe annet.

### Gjennomførbarhet med BMAD og Claude Code

Dere skal planlegge med BMAD (product brief → PRD → arkitektur → epics og stories) og implementere med Claude Code. Vurderingen under tar hensyn til at det må være tid til hele denne flyten, og til testing, retting og README til slutt.

| Spørsmål | Vurdering (OK / risiko / stor risiko) | Kommentar |
|---|---|---|
| **Tid og omfang** – kan v1 realistisk bli ferdig og stabil i løpet av semesteret, med tid til flere iterasjoner? | Risiko | Dere er godt i gang (sprint 1 og story 1.1 er startet), men epics-dokumentet har svært mange stories. Fire personer og god prioritering gjør det mulig, men bare hvis «bør ha» faktisk venter. |
| **BMAD-flyten** – er briefen konkret nok til at PRD, arkitektur og stories kan lages uten store hull, og blir det overkommelig mange stories? | OK | Briefen er svært konkret, og PRD, arkitektur og stories er allerede laget på den. Antall stories er høyt; marker tydelig hvilke som hører til «må ha». |
| **Egnet for Claude Code** – bruker løsningen en vanlig, godt dokumentert teknologistakk som Claude Code håndterer godt, eller krever den nisjeteknologi, spesialmaskinvare eller mye manuell konfigurasjon? | Risiko | React, TypeScript, Vite, Leaflet, Zod og Vitest er godt egnet. Supabase Edge Functions, planlagte jobber, RLS, Web Push og PWA på iPhone krever mye manuell konfigurasjon utenfor koden. |
| **Kontroll på KI-ens arbeid** – kan gruppen selv avgjøre om koden gjør det riktige? Krever domenet kunnskap gruppen ikke har, f.eks. avanserte beregninger eller fagregler, så er det vanskelig å kvalitetssikre. | OK | SnowScore og regneeksempelet gjør det mulig å kontrollere beregningene. Lag tilsvarende eksempler med fasit for beste skivindu, inkludert mørketid. |
| **Testbarhet** – finnes det tydelige regler og forventede resultater som tester kan skrives mot? | OK | Svært godt: egenskapstester, kontraktstester mot lagrede MET/NVE-svar og E2E-røyktest. Dere har også prioritert hva som er minimum. |
| **Kjørbar for sensor** – kan appen kjøres lokalt etter README, uten gruppens nøkler, betalte kontoer eller egen infrastruktur? | Stor risiko | Briefen beskriver separate utviklings- og produksjonsmiljøer i Supabase, men ikke hvordan en utenforstående kjører appen. Uten lokal oppsett med ferdige data vil sensor ikke kunne kjøre appen etter README. |
| **Avhengigheter og kostnader** – krever løsningen betalte API-er, f.eks. språkmodeller, og finnes det en plan for kostnad, testmodus eller mock-data? | Risiko | MET, NVE og Kartverket er gratis, men Supabase gratisnivå har begrensninger (bl.a. pauser og tidsgrenser), og Turnstile og Web Push krever kontoer og nøkler. Lagrede API-svar finnes allerede for kontraktstester; bruk dem også som demodata. |

**Konklusjon om gjennomførbarhet:**

- **Gjennomførbart med justert omfang.** Se forslagene under.

**Forslag til justering av omfang eller vanskelighetsgrad:**

1. Legg inn en «lokal demomodus» som et eget «må ha»-krav: appen kan startes lokalt (f.eks. med Supabase CLI eller en enkel seed) med ferdige værdata fra fixtures, uten at pipelinen må kjøre mot MET/NVE.
2. Forenkle pipelinen i v1: én planlagt jobb som henter, validerer og publiserer for ~300 steder holder. Flytt kretsbryter, eksponentiell ventetid og overvåkingsvarsler til «bør ha».
3. Flytt snøvarsel med Web Push og tilbakemelding med Turnstile helt til et senere trinn hvis «må ha» ikke er stabilt halvveis i implementeringen. Begge krever eksterne tjenester og er vanskelige for sensor å teste.

## Hvorfor product brief er viktig for mappen

Product brief er utgangspunktet for PRD, arkitektur, stories og til slutt koden. Del 1 av mappen vurderes blant annet på om sensor kan følge en sporbar vei fra plan til ferdig app. Den vurderes også på om appen gjør det dere har beskrevet, om den er testet, om den er godt designet, og om den kan kjøres etter README. Et uklart, for stort eller for lite brief gjør alt dette vanskeligere senere. Det er mye enklere å rette nå enn sent i semesteret.

## 1. Gjennomgang av briefens deler

| Del av brief | Status | Kommentar |
|---|---|---|
| Executive Summary – er det klart hva appen er, og hvilket problem den løser? | OK | Tydelig: et fargelagt Norgeskart, filter på egne krav og en forklarbar SnowScore, med ærlig forbehold om at dette er prognoser, ikke løypeforhold eller skredsikkerhet. |
| The Problem – er problemet konkret, med reelle situasjoner og brukere? | OK | Kort, men konkret: fragmentert informasjon og ingen tjeneste som svarer på «hvor i Norge oppfylles kravene mine nå?». |
| The Solution – beskriver løsningen brukeropplevelsen, ikke bare teknologi? | Juster | Skjermbildene (kart, stedsside, filter, forklaringsside) er godt beskrevet. Men briefen går langt inn i teknologi og drift (Edge Functions, staging, kretsbryter, RLS) som hører hjemme i arkitekturen. Det gjør briefen lang og omfanget større enn det virker. |
| What Makes This Different – er vurderingen ærlig og realistisk? | Juster | Det finnes ingen egen seksjon. Forskjellen (åpen, forklarbar poengsum og filter på tvers av hele landet) går fram av teksten, men si kort hvordan dette skiller seg fra yr.no, Skiinfo og lignende. |
| Who This Serves – er primærbrukerne tydelige, og vet vi hva de trenger? | OK | Skientusiaster som primær, turgåere som sekundær, med tre konkrete brukerhistorier. |
| Success Criteria – kan kriteriene faktisk sjekkes eller testes? | Juster | Korrekthet, robusthet og sporbarhet kan testes. Ytelse, ferskhet, WCAG og brukertester med fem personer er krevende å dokumentere. Legg til funksjonelle kriterier for kjerneflyten, og merk hvilke kriterier som er «bør ha». |
| Scope – er det klart hva som er med i første versjon, og hva som ikke er det? | OK | MoSCoW-tabellen er tydelig, og «Won't have» utelukker brukerkontoer, skredvarsling, booking og generativ værchat. |
| Vision – henger visjonen sammen med resten uten å blåse opp omfanget? | OK | Webkameraer, tidslinje og treffsikkerhetsmåler er tydelig plassert etter v1. |

## 2. Utgangspunkt for del 1 av mappen

Punktene følger kriteriene i sensorveiledningen for del 1. Vektene i parentes viser hvor mye hvert kriterium teller i del 1.

| Kriterium i del 1 | Hva briefen bør legge til rette for | Status | Kommentar |
|---|---|---|---|
| **1. Prosess og KI-styring** (30 %) | Brief som er presis nok til at PRD og stories kan bygges direkte på den, slik at krav kan spores fra brief til kode. | OK | Briefen er presis, og dere har allerede vist iterasjon (retting av SnowScore-formelen, MoSCoW) med logget prompts. Fortsett slik. |
| **2. Funksjonalitet og omfang** (20 %) | Realistisk omfang for gruppen og semesteret: en tydelig kjerneflyt som kan bli ferdig og stabil, og nok innhold til å vise reell funksjonalitet. | Juster | Rikelig med funksjonalitet, men risiko for at mye blir halvferdig. Hold fast ved «må ha» og vurder å forenkle pipelinen. |
| **3. Kvalitetssikring og testing** (15 %) | Suksesskriterier og funksjoner som er konkrete nok til å bli testtilfeller. | OK | Teststrategien er blant de mest gjennomarbeidede jeg har sett. Lag regneeksempler med fasit også for beste skivindu og filtrering. |
| **4. Design og brukeropplevelse** (10 %) | Tydelige brukere og brukssituasjoner som designet kan bygges rundt, gjerne med de viktigste skjermbildene eller flytene skissert. | OK | Tydelige skjermbilder, tilgjengelig listevisning som alternativ til kartet, tomtilstand ved null treff og egne DESIGN- og EXPERIENCE-dokumenter. |
| **5. Kodekvalitet og arkitektur** (10 %) | Teknologivalg som er begrunnet og ikke mer komplekse enn appen trenger. | Juster | Valgene er begrunnet, men arkitekturen (Edge Functions, kø, staging, kretsbryter, Web Push) er mer kompleks enn kjerneflyten trenger. Vurder hva som kan forenkles i v1. |
| **6. README og kjørbarhet** (10 %) | Løsning som andre kan kjøre lokalt uten betalte kontoer, og uten tilgang til gruppens egne tjenester og nøkler. | Endre | Avhengigheten til Supabase-prosjektet, Turnstile og Web Push må løses med lokalt oppsett og demodata, ellers kan ikke sensor kjøre appen etter README. |
| **7. Ryddighet i repoet** (5 %) | En plan for hvor hemmeligheter, testdata og dokumentasjon skal ligge. | Juster | Hemmeligheter på serversiden, versjonerte migrasjoner og fixtures er godt planlagt. Briefen finnes i to identiske kopier (`project-phase-folders/` og `project-workspace/`); sørg for at det er tydelig hvilken som er gjeldende, og at de ikke spriker over tid. |

## 3. Neste steg for gruppen

1. Legg til et krav i PRD og arkitektur om lokal kjøring med demodata (fixtures) og en `.env.example`, og test tidlig at et gruppemedlem kan starte appen fra et rent klon kun etter README.
2. Gå gjennom stories og merk hvilke som er «må ha». Vurder å forenkle pipelinen og flytte snøvarsel og tilbakemelding til senere sprinter.
3. Del suksesskriteriene i automatisk testede kriterier og brukertest-mål, og lag regneeksempler med fasit for beste skivindu.

Oppdater product brief i repoet når dere har gjort endringene, slik at historikken viser hvordan planen utviklet seg. Det er en del av prosessen sensor ser etter.
