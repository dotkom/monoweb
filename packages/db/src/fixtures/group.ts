import type { Prisma } from "@prisma/client"

export const getGroupFixtures = () =>
  [
    {
      slug: "appkom",
      abbreviation: "Appkom",
      name: "Applikasjonskomiteen",
      createdAt: new Date("2023-02-25 11:03:49.289+00"),
      shortDescription:
        "Applikasjonskomitten er ansvarlig for å utvikle og drifte sine egne IT-tjenester, som Online appen og infoskjermen på A4.",
      description:
        "Applikasjonskomiteen jobber med å utvikle ulike digitale tjenester for Online, som apper, nettsider og infoskjermer. Er du interessert å bli med på våre spennende prosjekter, eller har du lyst til å starte opp ditt eget prosjekt er appkom stedet for deg. Vi har blant annet tidligere laget Online appen, infoskjermen på A4 og diverse andre spill. For tiden jobber vi med å fullføre våre diverse andre prosjekter samt vedlikeholde og forberede våre lanserte prosjekter. Vi er alltid på utkikk å starte opp noe nytt og spennende, og setter veldig godt pris på nye ideer.\r\n\r\nVi er en sosial gjeng som liker å utvikle tjenester som vi syntes vil være både nyttig, men også underholderne for Online, og for studenter generelt. \r\nVi krever ingen forehåndskunnskaper, og har du noen spørsmål underveis er det bare å spørre din progge fadder, som vil være din mentor i oppstarten \u003C3",
      email: "appkom@online.ntnu.no",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/c3535390-05ed-40df-b155-8c4cade5ce47.png",
      type: "COMMITTEE",
    },
    {
      slug: "arrkom",
      abbreviation: "Arrkom",
      name: "Arrangementskomiteen",
      createdAt: new Date("2023-02-25 11:03:49.289+00"),
      description:
        "Arrangementskomiteen har som hovedansvar å arrangere sosiale tilstelninger for informatikkstudenter.\n\nOnline arrangerer både tradisjonsrike fester, og andre sosiale arrangementer, i løpet av skoleåret. Dette er et tilbud til deg slik at du kan ha det moro og knytte nye kontakter innad i linjeforeningen. Vi bidrar jobber for økt samhold og sosialisering blant Onlines medlemmer. Dette gjør vi ved å bidra til et variert sosialt tilbud for alle Onlinere.\n\nVi skal være en aktiv og synlig komité som inkluderer alle og sørger for å tilby et så variert tilbud av arrangementer at enhver av Onlines medlemmer kan stille på flest mulig av disse.",
      email: "arrkom@online.ntnu.no",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/xs/0954f3de-da25-44eb-b3a9-7dbba7e23f25.png",
      type: "COMMITTEE",
    },
    {
      slug: "backlog",
      abbreviation: "Backlog",
      name: "Backlog",
      description:
        "Backlog hovedoppgave er å bistå med kunnskap, erfaring og assistanse i linjeforeningens daglige drift. I tillegg har vi også ansvaret for:\r\n\r\nKomitékickoff for nye komitémedlemer\r\nBacklog oppretter og vedlikeholder prosjekter for å bedre Online sin drift.  Seniorkom tar selv opp medlemmer.",
      shortDescription:
        "Backlog hovedoppgave er å bistå med kunnskap, erfaring og assistanse i linjeforeningens daglige drift.",
      email: "backlog@online.ntnu.no",
      createdAt: new Date("2019-07-27T10:03:35+02:00"),
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/008459fe-272f-446c-b9c0-ef4a7cda9c16.png",
      type: "COMMITTEE",
    },
    {
      slug: "bankom",
      abbreviation: "Bankom",
      name: "Bank- og økonomikomiteen",
      description:
        "Bank- og økonomikomiteen er ansvarlig for alt det økonomiske innad i Online. Dette består av regnskapsføring, fakturering og å ha kontroll på det som skjer i nettbanken.\r\n\r\nKomiteen består av representanter fra alle komiteer som har ansvar for komiteenes regnskap og økonomi. Økonomiansvarlig er ansvarlig for Online sin økonomi, regnskapet til Hovedstyret og Fondet. Bankom-leder er ansvarlig for regnskapet til bankom og de andre komiteene.",
      shortDescription:
        "Bank- og økonomikomiteen er ansvarlig for alt det økonomiske innad i Online. Dette består av regnskapsføring, fakturering og å ha kontroll på det som skjer i nettbanken.",
      email: "bankom@online.ntnu.no",
      createdAt: new Date("2019-07-27T10:03:33+02:00"),
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/07418449-a797-4f71-83c1-d66867f935b7.png",
      type: "COMMITTEE",
    },
    {
      slug: "bedkom",
      abbreviation: "Bedkom",
      name: "Bedriftskomiteen",
      createdAt: new Date("2023-02-23 11:03:49.289+00"),
      description:
        "Bedriftskomiteen er bindeleddet mellom næringslivet og informatikkstudenter, og skal i tillegg samarbeide med andre linjeforeninger på NTNU for å ivareta informatikkstudentenes interesser. Vårt mål er å kommunisere og formidle våre studenter som potensielle arbeidstakere til aktuelle bedrifter på en positiv måte. For å fremme dette er bedriftspresentasjoner en viktig del av vårt virke, i tillegg til andre måter å kommunisere ut informasjon til studentene - på en god måte.\n\nVi er en hardtarbeidende komitè som igjennom mange år har opparbeidet oss et meget stort kontaktnett av bedrifter. Bedriftskomiteen opererer som en kontaktpunkt for bedrifter og studentene på informatikkstudiet.\n\nSom medlem i bedriftskomiteen får du en unik mulighet til å komme i kontakt med mange bedrifter, som vil gagne dine medstudenter og deg selv.",
      email: "bedkom@online.ntnu.no",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/xs/974b88bd-de01-4b59-856f-f53d9bb600a0.png",
      type: "COMMITTEE",
    },
    {
      slug: "debug",
      abbreviation: "Debug",
      name: "Debug",
      description: "Debug er en ko",
      email: "debug@online.ntnu.no",
      createdAt: new Date("2021-10-31T20:37:31+01:00"),
      type: "COMMITTEE",
    },
    {
      slug: "dotdagene",
      abbreviation: "dotDAGENE",
      name: "dotDAGENE",
      description:
        "Bli med og skap noe helt nytt!\r\nNeste semester lanserer vi Karrieredagene for Online, og vi søker deg som vil være med på å bygge dette prosjektet fra bunnen av! Karrieredagene skal bli en plattform som kobler studenter med bedrifter og karrieremuligheter. For å få dette til, trenger vi engasjerte og kreative hoder som brenner for å gjøre en forskjell.\r\n\r\nViktig å vite:\r\nKarrieredagene-komiteen er ikke en komité eller nodekomité under Online, men en komité under organisasjonen Ekskom, noe som betyr at du kan være med så lenge du ønsker og har kapasitet til å bidra. Vi ser etter studenter fra alle klassetrinn, så uansett om du går i første klasse eller nærmer deg slutten av studiene, er du velkommen til å søke!\r\n\r\nForeløpig ser vi for oss følgende roller:\r\n* Arrangementansvarlige: Har ansvar for logistikken rundt selve arrangementet, inkludert booking av lokaler, tidsplan og teknisk utstyr.\r\n* PR- og kommunikasjonsansvarlige: Sørger for promotering av arrangementet, utvikler markedsføringsmateriale og jobber med å nå ut til studenter og bedrifter.\r\n* Bedriftskoordinatorer: Jobber med å kontakte og følge opp bedrifter som ønsker å delta, og sørger for god kommunikasjon og samarbeid med dem. \r\n* Økonomiansvarlig: Holder oversikt over budsjettet, søker om midler og sørger for at komiteen holder seg innenfor økonomiske rammer.\r\n\r\nVi ser etter deg som:\r\n* Er strukturert og liker å organisere.\r\n* Har lyst til å ta ansvar og jobbe i team.\r\n* Vil være med på å forme et prosjekt med stort potensial.\r\n* Dette er en unik sjanse til å få verdifull erfaring og gjøre noe som kan ha stor betydning for både deg og dine medstudenter. Bli med og skap noe nytt!",
      email: null,
      type: "COMMITTEE",
    },
    {
      slug: "dotkom",
      createdAt: new Date("2023-02-22 13:30:04.713+00"),
      abbreviation: "Dotkom",
      name: "Drifts- og utviklingskomiteen",
      description:
        "Dotkom er komiteen som er ansvarlig for utvikling og vedlikehold av Online sine nettsider, samt drift av maskinparken.\n\nDotkom har også ansvaret for å sikre at Online på best mulig måte benytter IT i sine arbeidsprosesser, der Online er tjent med det. Dotkom er som følge av det, også forpliktet til å utvikle og vedlikeholde IT-systemer som Online er tjent med - med hensyn til Online som linjeforening og Online sine studenter.",
      email: "dotkom@online.ntnu.no",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/xs/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
      type: "COMMITTEE",
    },
    {
      slug: "ekskom",
      createdAt: new Date("2019-07-27T10:03:35+02:00"),
      abbreviation: "Ekskom",
      name: "Ekskursjonskomiteen",
      description:
        "Ekskom organiserer vår årlige ekskursjon. I løpet av studiet får alle informatikkstudentene tilbud om å bli med på en ekskursjon til utlandet. Her besøker man næringsliv, utdanningsinstitusjoner eller andre faglig relevante steder. I tillegg får man en god porsjon sosialt påfyll. Tidligere turer har gått til Kina, USA, Japan og Sør-Korea. Hvem vet hva det neste blir?",
      shortDescription: "Ekskom organiserer Onlines årlige ekskursjon.",
      email: "ekskom@online.ntnu.no",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/625ea6b5-3c6f-4f1e-9b90-d9e2706792a6.png",
      type: "NODE_COMMITTEE",
    },
    {
      slug: "fagkom",
      abbreviation: "Fagkom",
      name: "Fag- og kurskomiteen",
      description:
        "Fag- og kurskomiteen jobber med å arrangere kurs, workshop, faglige presentasjoner og andre faglige arrangementer for studentene ved informatikk.\r\n\r\nVårt mål er å tilby kunnskap en ikke får gjennom skolen, slik som webutvikling, hacking og andre aktuelle teknologier. Vi holder også eksamenskurs i enkelte emner; kursholderne er ofte studenter, men mange holdes av eksterne bedrifter, gjerne da med bespisning og muligheter til å mingle med bedriften.",
      shortDescription:
        "Fag- og kurskomiteen jobber med å arrangere kurs, workshop, faglige presentasjoner og andre faglige arrangementer for studentene ved informatikk.",
      email: "fagkom@online.ntnu.no",
      createdAt: new Date("2019-07-27T10:03:34+02:00"),
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/7ab7419d-61c5-499f-87f3-ebbc2a5e6b1c.png",
      type: "COMMITTEE",
    },
    {
      slug: "feminit",
      abbreviation: "FeminIT",
      name: "Females in IT",
      description:
        "FeminIT er en gruppe som er skapt for å bedre og ikke minst opprettholde samholdet mellom jenter og ikke-binære på informatikk. FeminIT startet som en gruppering i 2021 og etter hvert som flere medlemmer ble med, ble FeminIT en komité under generalforsamlingen våren 2022. På informatikk er det rundt 20% jenter (2021), noe som er altfor lite. FeminIT arrangerer alt fra eksamenslesing, kafeonsdag, sirkeltrening og egentlig alt som medlemmene har lyst til å finne på. Målet med FeminIT er derfor å skape et bedre samhold mellom jentene på informatikk i håp om å bedre bekjentskap på samme og på tvers av trinn.",
      shortDescription:
        "FeminIT er en gruppe som er skapt for å bedre og ikke minst opprettholde samholdet mellom jenter og ikke-binære på informatikk. FeminIT startet som en gruppering i 2021 og etter hvert som flere medlemmer ble med, ble FeminIT en komité under generalforsamlingen våren 2022. På informatikk er det rundt 20% jenter (2021), noe som er altfor lite. FeminIT arrangerer alt fra eksamenslesing, kafeonsdag, sirkeltrening og egentlig alt som medlemmene har lyst til å finne på. Målet med FeminIT er derfor å skape et bedre samhold mellom jentene på informatikk i håp om å bedre bekjentskap på samme og på tvers av trinn.",
      email: "feminit@online.ntnu.no",
      createdAt: new Date("2021-11-05T12:26:35+01:00"),
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/8c43581c-19da-48c2-8b96-75d09e12abae.png",
      type: "COMMITTEE",
    },
    {
      slug: "hs",
      createdAt: new Date("2023-02-15 11:03:49.289+00"),
      abbreviation: "Hovedstyret",
      email: "hovedstyret@online.ntnu.no",
      description:
        "Hovedstyret velges av linjeforeningens medlemmer på generalforsamlingen i løpet av vårsemesteret og sitter ett år frem i tid. Styret består av leder, nestleder, økonomiansvarlig og alle styremedlemmene.\n\nHovedstyret er først og fremst en møteplass for koordinering av de forskjellige komiteene. Styret driver også med økonomistyring og annet administrativt arbeid.\n\nHovedstyret er også linjeforeningens ansikt utad, og opprettholder kontakten med fakultet, institutt og representerer Online ved forskjellige anledninger.",
      type: "COMMITTEE",
    },
    {
      slug: "jubkom",
      abbreviation: "Jubkom",
      name: "Jubileumskomiteen",
      description:
        "Jubkom har ansvaret for å organisere Onlines jubileum hvert femte år. Dette er en bursdagsfeiring uten sidestykke og ikke noe man bør gå glipp av. Neste jubileum er i 2026. Har du spørsmål, tips eller innspill kan jubKom kontaktes på epost",
      shortDescription:
        "Jubkom har ansvaret for å organisere Onlines jubileum hvert femte år. Dette er en bursdagsfeiring uten sidestykke og ikke noe man bør gå glipp av. Neste jubileum er i 2026. Har du spørsmål, tips eller innspill kan jubKom kontaktes på epost",
      email: "jubkom@online.ntnu.no",
      createdAt: new Date("2019-07-27T10:03:33+02:00"),
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/625ea6b5-3c6f-4f1e-9b90-d9e2706792a6.png",
      type: "NODE_COMMITTEE",
    },
    {
      slug: "oil",
      abbreviation: "Online-IL",
      name: "Online Idrettslag",
      description:
        "Online idrettslag står for arrangering av sport og idrett for Informatikkstudenter. Komiteen tilbyr et lavterskel tilbud som skal passe for alle. Som medlem i komiteen vil du få muligheten til å planlegge og arrangere idretter du har lyst til å være med på.",
      email: "online-il@online.ntnu.no",
      createdAt: new Date("2019-07-27T10:03:35+02:00"),
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/411fb970-1e76-4059-a874-8c45c4155947.png",
      type: "COMMITTEE",
    },
    {
      slug: "output",
      abbreviation: "Output",
      name: "Output",
      description: "Output er et band",
      email: "band@online.ntnu.no",
      createdAt: new Date("2020-02-20T12:12:11+01:00"),
      type: "ASSOCIATED",
    },
    {
      slug: "prokom",
      abbreviation: "Prokom",
      name: "Profil- og aviskomiteen",
      description:
        "Vi i profil- og aviskomiteen (prokom) er ansvarlige for profileringen av Online. Hvis du ser noe fett på A4 eller på Online sine SoMe, er det nok prokom som står bak. Vi lager plakater, bannere, ikoner og den grafiske profilen til linjeforeningen. Vi mekker video, tar bilder og lager lættis innhold som brukes på sosiale media. Vi skriver Offline, linjeforeningens tidsskrift, og designer merch som slippes hvert semester. Du kan altså velge mellom å designe, skrive, tegne, lage sketcher, bli motedesigner og mye mer. Du kan jobbe mest med én ting, eller med litt av alt. Ved å være med i prokom får du drevet med det kreative. Det er et deilig avbrekk fra programmerings-hverdagen og en attraktiv erfaring for jobbsøking senere. Du får også bli en del av en sosial gjeng, som drar på hyttetur og blåtur, og finner på MASSE gøy i lag!",
      shortDescription:
        "Profil- og aviskomiteens hovedoppgave er å sikre kvalitet på profileringsmateriell, samt gi ut linjeforeningens tidsskrift, Offline.",
      email: "prokom@online.ntnu.no",
      createdAt: new Date("2019-07-27T10:03:33+02:00"),
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/f4aea8d0-a8b3-48aa-b49f-2f7aa2a1ad08.png",
      type: "COMMITTEE",
    },
    {
      slug: "rfk",
      abbreviation: "Kjelleren",
      name: "Realfagskjelleren",
      description:
        "Realfagskjelleren på Moholt er en studentdrevet bar som tilbyr rimelig drikke, nye bekjentskap og artige fester!\r\n\r\nAdresse: Herman Krags Veg 12 \r\nFacebookside: Realfagskjelleren\r\n\r\nRealfagskjelleren drives i samarbeid med linjeforeningene Spanskrøret (lektorutdanning i realfag), Delta (matematikk og fysikk) og Volvox & Alkymisten (biologi, kjemi og bioteknologi). Det drives også andre linjeforeningskjellere på Moholt, de fleste linjeforeningene på Gløshaugen har tilgang på en kjeller. Kjellerstyremedlemmene jobber frivillig for å få i gang fester og andre sosiale sprell for studenter som studerer realfag. På Kjelleren arrangeres det fester på tvers av linjeforeningene, i tillegg til arrangementer arrangert av linjeforeningene hver for seg.\r\n\r\nDet er mulig for enkeltpersoner å leie kjelleren til private arrangementer. Ta i så fall kontakt med kjellerstyret/kjelleransvarlig i god tid (minst en uke) før dagen du ønsker å leie.",
      shortDescription:
        "Realfagskjelleren på Moholt er en studentdrevet bar som tilbyr rimelig drikke, nye bekjentskap og artige fester!",
      email: "styret@realfagskjelleren.no",
      createdAt: new Date("2019-07-27T10:03:35+02:00"),
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/4b9cfe30-c5fc-4b93-9dbd-c375b1d025a4.png",
      contactUrl: "https://realfagskjelleren.no",
      type: "ASSOCIATED",
    },
    {
      slug: "trikom",
      abbreviation: "Trikom",
      name: "Trivselskomiteen",
      description:
        "Trivselskomiteen har ansvaret for trivsel blant studentene og drift av kontoret.\r\n\r\nHva skjer på kontoret akkurat nå? Se kalenderen. Send oss gjerne en epost dersom du har noen ideer til ting trikom kan finne på!\r\n\r\nOnlinekontoret ligger i fjerde etasje rom A4-137 i Realfagbygget på NTNU Gløshaugen. Ta heisen opp i 4. over kantina så finner man oss på der.\r\n\r\nKontoret er et sosialt sted man kan stikke innom for en kopp kaffe, en prat, hjelp med øvinger og mye mer. Det er en samlingsplass for alle Onlines medlemmer.\r\n\r\nI undervisningsperioden skal kontoret være åpent 10:00-16:00 på hverdager. Det er som regel folk på kontoret utenom åpningstidene, så kontoret er ofte åpent utenom disse tidspunktene.\r\n\r\nAlle som går på BIT & MIT skal ha tilgang til kontoret.",
      shortDescription: "Trivselskomiteen har ansvaret for trivsel blant studentene og drift av kontoret.",
      email: "trikom@online.ntnu.no",
      createdAt: new Date("2019-07-27T10:03:34+02:00"),
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/86b12d11-5326-48c9-bdd2-3830f8fa376b.png",
      type: "COMMITTEE",
    },
    {
      slug: "velkom",
      abbreviation: "Velkom",
      name: "Velkomstkomiteen",
      description:
        "Velkom arrangerer de årlige fadderukene. Dette er som regel studentenes første møte med Online og det er deres oppgave å sørge for at alle nye føler seg velkomne. Fadderukene byr som regel på alt fra fester til grilling og byrebus.",
      shortDescription:
        "Velkom arrangerer de årlige fadderukene. Dette er som regel studentenes første møte med Online og det er deres oppgave å sørge for at alle nye føler seg velkomne. Fadderukene byr som regel på alt fra fester til grilling og byrebus.",
      email: "velkom@online.ntnu.no",
      createdAt: new Date("2019-07-27T10:03:32+02:00"),
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/625ea6b5-3c6f-4f1e-9b90-d9e2706792a6.png",
      type: "NODE_COMMITTEE",
    },

    // Interest groups
    {
      slug: "x-sport",
      abbreviation: "X-Sport",
      name: "X-Sport",
      description:
        "Retningslinjer for styret til interessegruppen X-Sport\r\n§0 Formål\r\nInteressegruppen X-Sport skal fremme sportslige aktiviteter for medlemmene, med fokus på surfing, toppturer og andre ekstreme aktiviteter. Styret er ansvarlig for å planlegge og gjennomføre aktiviteter i tråd med interessegruppens formål.\r\n§1 Styrets sammensetning\r\n•\tLeder – har det overordnede ansvaret for gruppens drift, leder styremøtene, og representerer interessegruppen utad.\r\n•\tNestleder – assisterer lederen og tar over lederens oppgaver ved fravær. Bidrar til planlegging og gjennomføring av aktiviteter.\r\n•\tSurfetur ansvarlig – har hovedansvaret for planlegging og gjennomføring av surfetur(er).\r\n•\tSekretær (valgfritt) – fører referat fra møter\r\n•\tTopptur ansvarlig (valgfritt) – har hovedansvaret for planlegging og gjennomføring av toppturer.\r\n•\tØvrige medlemmer – Har stemmerett og møteplikt\r\n\r\n§2 Fortrinnsrett til arrangementspåmelding\r\nArrangør(er) har fortrinnsrett til interessegruppens arrangementer.\r\n\r\n§3 Endringer i retningslinjer\r\nEndringer i retningslinjene kan foreslås av styret eller medlemmene. Endringsforslag behandles og vedtas på generalforsamlingen, og krever simpelt flertall for å tre i kraft.",
      shortDescription:
        "Interessegruppen X-Sport skal fremme sportslige aktiviteter for medlemmene, med fokus på surfing, toppturer og andre ekstreme aktiviteter. Styret er ansvarlig for å planlegge og gjennomføre aktiviteter i tråd med interessegruppens formål.",
      email: "x-sport@online.ntnu.no",
      createdAt: new Date("2019-10-31T11:21:39+01:00"),
      type: "INTEREST_GROUP",
    },
    {
      slug: "racingline",
      abbreviation: "RacingLine",
      name: "RacingLine",
      description:
        "RacingLine er interessegruppen for deg som digger å benkre deg ned foran fjernsynsapparatet hver søndag for å se dyre biler kjøre i 300km/t 60 ganger rundt i ring.",
      contactUrl: "https://online.ntnu.no/wiki/online/info/innsikt-og-interface/interessegrupper/racingline/",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/1f0e434b-9ba1-4a1f-ab3b-f72bd6194f19.png",
      type: "INTEREST_GROUP",
    },
    {
      slug: "folk-som-er-glad-i-jul",
      abbreviation: "Folk som er glad i jul",
      name: "Folk som er glad i jul",
      description:
        "Interessegruppen for folk som er glad i jul er interessegruppen for, you guessed it, de som  er glad i jul. Gruppens største formål er å spre julens glade budskap, samt spre juleglede når det måtte passe seg.",
      contactUrl:
        "https://online.ntnu.no/wiki/online/info/innsikt-og-interface/interessegrupper/interessegruppen-folk-som-er-glad-i-jul/",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/aa578573-2cd5-4dd1-9eb4-2392373edd16.png",
      type: "INTEREST_GROUP",
    },
    {
      slug: "vodka-i-skogen",
      abbreviation: "Vodka i Skogen",
      name: "Vodka i Skogen",
      description:
        "Interessegruppen for vodka i skogen er en gruppe for deg som er glad i vodka og skog. Gruppa organiserer turer ut i skogen for å drikke vodka.",
      contactUrl: "https://onlinentnu.slack.com/archives/C06TGF0J0ER",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/338560b3-5ac6-4005-944a-9eea2d323087.png",
      type: "INTEREST_GROUP",
    },
    {
      slug: "faxe-ordenen",
      abbreviation: "Faxe-ordenen",
      name: "Faxe-ordenen",
      description:
        "Faxe Orden er Onlines ridderlige broderskap for deg som ønsker å heve et glass (eller en boks) i fellesskap! Vi hyller den hellige Faxe gjennom mystiske ritualer, episke eventyr, og brorskapets helligste skål. Bli med oss i kampen for ære og iskalde dråper – eller bare for å ha det gøy med andre Fax",
      contactUrl: "https://onlinentnu.slack.com/archives/C07R2T5LH70",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/844d8052-b3fd-4154-9a8d-728974b3b0d9.png",
      type: "INTEREST_GROUP",
    },
    {
      slug: "mineline",
      abbreviation: "Mineline",
      name: "Mineline",
      description:
        "Mineline er interessegruppen for Onlines Minecraft-server, og som samles av og til for å spille på den.",
      contactUrl: "https://wiki.online.ntnu.no/info/innsikt-og-interface/interessegrupper/mineline/",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/1718fff4-9a90-44a7-82ec-bfd8941fc0c5.png",
      type: "INTEREST_GROUP",
    },
  ] as const satisfies Prisma.GroupCreateManyInput[]

export const getGroupRoleFixtures = (groupInput: Prisma.GroupCreateInput) =>
  [
    {
      groupId: groupInput.slug,
      name: "Leder",
      type: "LEADER",
    },
    {
      groupId: groupInput.slug,
      name: "Vinstraffansvarlig",
      type: "PUNISHER",
    },
    {
      groupId: groupInput.slug,
      name: "Nestleder",
      type: "DEPUTY_LEADER",
    },
    {
      groupId: groupInput.slug,
      name: "Tillitsvalgt",
      type: "TRUSTEE",
    },
    {
      groupId: groupInput.slug,
      name: "Økonomiansvarlig",
      type: "TREASURER",
    },
    {
      groupId: groupInput.slug,
      name: "Medlem",
      type: "COSMETIC",
    },
  ] as const satisfies Prisma.GroupRoleCreateManyInput[]
