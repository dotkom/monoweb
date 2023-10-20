import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

const employments = {
  fulltime: "Fulltid",
  parttime: "Deltid",
  internship: "Sommerjobb/internship",
  other: "Annet",
} as const

export const jobListings: Insertable<Database["jobListing"]>[] = [
  {
    id: "01HD77R4Y4S3WJ44NZ8029VP4P",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Job at Bekk",
    ingress: "Join us at Bekk!",
    description: "Et konsulentselskap som forøvrig er hovedsponsor for Online Linjeforening",
    start: new Date("2023-03-15"), // Placeholder date
    end: new Date("2023-12-31"), // Placeholder date
    featured: true, // Placeholder value
    deadline: null,
    employment: employments.fulltime,
    applicationLink: "https://bekk.no/jobs", // Placeholder link
    applicationEmail: "bekk@bekk.no",
    deadlineAsap: false, // Placeholder value
  },
  {
    id: "01HD77R4Y764E5Q5DY9YTT9ZF6",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Job at Junior Consulting",
    ingress: "Become a consultant at Junior Consulting!",
    description: "Et konsulentselskap drevet av erfaringssultne studenter",
    start: new Date("2023-03-20"), // Placeholder date
    end: new Date("2023-12-31"), // Placeholder date
    featured: true, // Placeholder value
    deadline: null,
    employment: employments.internship,
    applicationLink: "https://www.jrc.no/jobs", // Placeholder link
    applicationEmail: "test@jrc.no",
    deadlineAsap: false, // Placeholder value
  },
  {
    id: "01HD77R4Y7RHCCQ5SYN31CVFRG",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Software engineer - summer intern",
    ingress:
      "Er du på utkikk etter sommerjobb innenfor edtech-sektoren? Kateter har oppnådd stor suksess ved å tilby Gløsinger kurs i utfordrende fag til en billig penge.",
    description:
      "### Summer internship\r\n\r\nI løpet av sommeren som var (2023) hadde vi 13 interns hos oss, deriblant utviklere, business interns, designere og kursdesignere. Mellom slaga var vi på hyttetur, båtturer og hadde mye sosialt på takterassen vår ved Nationaltheatret. Internsa våre utviklet selvstendig et grafikkbibliotek, og en AI-utvidelse som vi snart skal implementere på siden vår. Neste sommer har vi en stor jobb foran oss for å videreutvikle disse verktøyene, og bygge det inn i en ny helhetlig plattform - langt mer avansert enn vår nåværende. Vi er derfor på utkikk etter flere tech-entusiaster, som også synes start-up er gøy!\r\n\r\nI sommer skal vi ansette mellom 6 og 10 tech-interns for å bygge avansert AI til bruk i det vi mener er dets viktigste anvendelsesområde, nemlig utdanning. Under internshippet vil du jobbe i team med andre interns, og med støtte fra erfarne. Vi er alle studenter, så vi kan love et ungt og energisk miljø. Vi er sikre på at vi kan tilby deg solid faglig utvikling, i samarbeid med dyktige medarbeidere.\r\n\r\n### Hvem er du?\r\n\r\nVi ser primært etter mennesker som brenner for det samme som oss. Du bør selvfølgelig ha noe teknisk kompetanse for å søke på denne stillingen, men vi ønsker ikke å lage en liste over krav. Om du brenner for tech og synes vårt mission er spennende, send inn en søknad til rekruttering@kateter.no!",
    applicationLink: "https://rekruttering@kateter.no/om-oss/stillinger/utvikler",
    applicationEmail: "",
    start: new Date("2023-10-15T15:08:23+02:00"),
    end: new Date("2023-10-19T23:54:59+02:00"),
    featured: false,
    deadline: new Date("2023-10-19T23:55:55+02:00"),
    deadlineAsap: false,
    employment: employments.internship,
  },
  {
    id: "01HD77R4Y7XW6S2VBTPBJWMTN0",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Produktutvikler",
    ingress:
      "Brenner du for å skape noe nytt, og få ting til å skje? Vi er et team på seks personer med mål om å utvikle revolusjonerende teknologi for kunder over hele verden, og ser etter deg som ønsker å være med på reisen fremover.",
    description:
      "DU VIL VÆRE MED Å\r\n\r\n- Raskt se effekten av jobben du gjør, og jobbe tett på kundene\r\n- Bli en del av kjerneteamet i en raskt voksende oppstartsbedrift\r\n- Være med å utvikle fremtidens teknologi for strikkere over hele verden\r\n- Mulighet for fulltidsstilling og eierandeler i selskapet\r\n\r\nOM DREAMKNIT\r\n\r\nI Norge er det tre ganger så mange som strikker som spiller fotball(!). Til tross for en stor og voksende kundegruppe har det skjedd lite med produktene som tilbys strikkere. Markedet er sultent på nye teknologiløsninger og modernisering. Vi i Dreamknit gjør noe med akkurat dette, og har utviklet en webapplikasjon der strikkere kan designe sine egne gensere og kjøpe en digital oppskrift, automatisk generert og sendt på noen sekunder. Vi har nå kunder fra hele verden, og vokser raskt i blant annet Norge, USA, Tyskland og Australia.\r\n\r\nHVA GÅR JOBBEN UT PÅ?\r\n\r\nVi er på jakt etter deg som er nysgjerrig på startup-tilværelsen og vil være med på reisen videre. Som en del av teamet vil du ha stor påvirkningskraft på hva vi utvikler og hvordan, og raskt se resultater av jobben du gjør.\r\n\r\nAv egenskaper ser vi etter deg som strikker, eventuelt også hekler. Det er positivt om du har kjennskap til Python og Git, men det viktigste er at du er glad i matematikk, og koding, er lærevillig og engasjert, og ønsker å være med på å bygge noe revolusjonerende!\r\n\r\nTeamet er lokalisert i egne kontorlokaler på coworking-spacet DIGS i Trondheim, og du vil i denne stillingen jobbe tett med hele teamet og produktansvarlig for å videreutvikle nye produktsegmenter, samt forbedre eksisterende oppskrifter og design.\r\n\r\nLes mer om oss og sjekk ut løsningene våre på [www.dreamknit.no](http://www.dreamknit.no/). Har du spørsmål angående stillingen eller selskapet, er det bare å kontakte oss for en prat.\r\n\r\nSøknader sendes direkte på mail til [ingrid@dreamknit.no](mailto:ingrid@dreamknit.no). Fortell litt om deg selv, hva du kan tilby og hva du ser for deg i en jobb hos oss. Legg også ved CV og eventuelt karakterutskrift. Plusspoeng om du legger ved en fun fact om deg selv!\r\n\r\nSøknader vurderes fortløpende. Vi ser frem til å høre fra deg!\r\n\r\nSøknadsfrist: søndag 22. oktober 2023",
    applicationLink: "https://www.dreamknit.com/jobs",
    applicationEmail: "",
    start: new Date("2023-10-09T10:00:00+02:00"),
    end: new Date("2023-10-22T23:59:00+02:00"),
    featured: false,
    deadline: new Date("2023-10-22T23:59:00+02:00"),
    deadlineAsap: false,
    employment: employments.parttime,
  },
  {
    id: "01HD77R4Y9HFYK1NJV8SKSPKN3",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Energisommerjobb 2024: Vil du være med å forme fremtiden?",
    ingress:
      "Nå kan du prøve deg som forsker for en sommer hos SINTEF, et av Europas største uavhengige forskningsinstitutt!",
    description:
      "SINTEF Energi utvikler fremtidens bærekraftige energiløsninger. I tett samarbeid med NTNU, industri og næringsliv, forsker vi fram ny teknologi med visjonen **teknologi for et bedre samfunn**.\r\n\r\nHver sommer ansetter vi studenter for å forske sammen med oss på våre prosjekter, med tilgang til verdensledende laboratorier og veiledning fra våre forskere. Nå vil vi at du skal bli en av dem, og få mulighet til å utvikle bærekraftig energiteknologi som skal bidra til å redde verden.\r\n\r\n**I år lyser vi ut totalt 38 sommerjobber fordelt på disse avdelingene:**\r\n\r\n- **Elkraftteknologi (ET) 7 jobber**\r\n- **Gassteknologi (GT) 10 jobber**\r\n- **Termisk Energi (TE) 9 jobber**\r\n- **Energisystemer (ES) 12 jobber**\r\n\r\n**Du finner alle jobbene ved å trykke søk her.**\r\n\r\nSøknadsfrist er 5. november.",
    applicationLink: "https://www.sintef.no/sintef-energi/sommerjobb_i_sintef_energi/",
    applicationEmail: "",
    start: new Date("2023-10-08T10:14:24+02:00"),
    end: new Date("2023-11-05T23:59:59+01:00"),
    featured: false,
    deadline: new Date("2023-11-05T23:59:59+01:00"),
    deadlineAsap: false,
    employment: employments.internship,
  },
  {
    id: "01HD77R4Y9D8FJ8WHBY6GF67AW",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Sommerjobb i Sticos",
    ingress:
      "I perioden juni - august søker vi studenter til sommerjobb. Du får også anledning til å ta 3-4 uker ferie i juli.",
    description:
      "I perioden juni - august søker vi studenter til sommerjobb. Du får også anledning til å ta 3-4 uker ferie i juli.  \r\n  \r\nVi søker deg som er nysgjerrig på å prøve ut dine ferdigheter på konkrete arbeidsoppgaver innen programvareutvikling. Vi fokuserer på inspirerende og effektive løsninger, og vi jobber med moderne teknologi.\r\n\r\nVi søker utviklere og UX-designere som skal jobbe i vårt tverrfaglig utviklingsmiljø i Sticos. Du vil bli en del av vårt arbeidsmiljø gjennom sommeren, og vi stiller selvfølgelig med veiledning og støtte underveis.  \r\n  \r\n**Jobben i Sticos**\r\n\r\nI Sticos er vi organisert i kryssfunksjonelle team. En typisk dag starter med standup-møte hvor vi gjennomgår dagens oppgaver før vi setter i gang med å løse de. Teamene har tett dialog med vår fagavdeling, som består av blant annet jurister og økonomer. Teamene er smidige og selvstyrte, og har stor påvirkning på hvordan arbeidsoppgaver skal løses.\r\n\r\nDe fleste av våre applikasjoner er utviklet i Angular og .NET/C# med MS-SQL backend. Vi kjører på Azure Cloud. Vi bruker også følgende verktøy: Confluence, Jira, Git, Azure DevOps. Hos oss er det rom for eksperimentering og faglig utvikling.  \r\n  \r\n**Som ansatt i Sticos får du:**\r\n\r\nJobbe i et sterkt fagmiljø, og vi satser bevisst på å bygge kompetanse ved å gi våre medarbeidere tid og mulighet til å lære, innovere og utvikle seg.\r\n\r\n-   Et innovativt og inkluderende arbeidsmiljø med hyggelige kollegaer.\r\n-   Jobbe i et av Trondheims største utviklermiljø.\r\n-   Lønn etter avtale.\r\n-   Et godt arbeidsmiljø. Humor og trivsel betyr mye.\r\n-   En sosial gjeng som er opptatt av å ha det gøy – også utenfor arbeidstiden.\r\n-   Godt utstyrt treningsrom i kjeller og et aktivt bedriftsidrettslag.\r\n-   Matpakke trenger du ikke. Vi tilbyr gratis lunsj i vår kantine.\r\n-   Gode forsikringsordninger, du er trygg om det skulle skje noe.\r\n-   Fleksibel arbeidstid, kjernetid 09:00 – 14:30",
    applicationLink: "https://sticos.recman.no/job.php?job_id=346359",
    applicationEmail: "",
    start: new Date("2023-10-03T19:33:00+02:00"),
    end: new Date("2023-12-01T23:59:59+01:00"),
    featured: false,
    deadline: new Date("2023-12-01T23:59:59+01:00"),
    deadlineAsap: false,
    employment: employments.internship,
  },
  {
    id: "01HD77R4Y998QA09CMCAJKGSD7",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Sommeren er best hos Avinor – bli med å utvikle fremtidens luftfart!",
    ingress:
      "Kunne du tenke deg en sommer der du er med og bidrar til å gjøre en liten forskjell i verden og samtidig gi deg selv en flying start på egen karriere? Avinors sommerprogram 2024 er klar for din søknad. Velkommen til oss!",
    description:
      '# Sommeren er best hos Avinor – bli med å utvikle fremtidens luftfart!\r\n\r\nArbeidsgiver: Avinor AS\r\n\r\nStillingstittel: Summer internship 2024\r\n\r\nFrist: 02.11.2023\r\n\r\nAnsettelsesform: Engasjement\r\n\r\n[Bli kjent med Avinor AS](https://www.finn.no/job/employer/company/532)\r\n\r\nKunne du tenke deg en sommer der du er med og bidrar til å gjøre en liten forskjell i verden og samtidig gi deg selv en flying start på egen karriere? Avinors sommerprogram 2024 er klar for din søknad. Velkommen til oss!\r\n\r\nHva sier du til å bli en del av et dyktig team som gjennom sommeren får sjansen til å jobbe med spennende problemstillinger sammen med andre sommerstudenter? Og hvor dere sammen får være med å skape løsninger som til slutt presenteres for ledelsen i selskapet? Dette gir dere en unik mulighet til å lære å presentere i forskjellige fora! Gjør sommeren 2024 til din sommer og til den beste noensinne.\r\n\r\n## Hvorfor summer internship i Avinor?\r\n\r\nDu kjenner kanskje Avinor best fra når du skal ut på reise, men hvor ofte tenker du egentlig på at Avinor gjør det faktisk mulig å bo og drive næring i hele landet vårt? Visste du at vi har ansvaret for nesten 600 000 avganger og landinger og at over 50 millioner passasjerer er innom oss årlig, eller at vi jobber intenst med å skape løsninger som effektiviserer flybevegelsene i lufta og som kan spare kloden for betydelige klimagassutslipp?\r\n\r\nVi utvikler selv og forvalter en kompleks infrastruktur som er avgjørende for den operasjonelle driften og en rekke digitale systemer som er essensielle gjennom hele passasjerreisen - blant annet avinor.no, passasjerapp, partnerappen Community , innsjekkingssystemer, bagasjehåndtering, flytider, fjernstyrte tårn og andre tårnkontrolltjenester, flygeinformasjonstjenester, værobservasjonstjenester, cyber security og mye mer! Avinor og luftfarten er inne i en utrolig spennende tid. I årene som kommer skal vi jobbe målrettet med å nå klimamålene, selskapet vil bli preget av stor teknologisk utvikling og vi skal tilpasse luftfarten nye reisemønstre etter pandemien. Vi har også fått verdens største tårnsenter på plass hvor vi kan fjernstyre andre tårn i Norge ved hjelp av avansert teknologi. Avinor blir ansvarlig for å håndtere en enorm vekst av droner med nye drone-operasjoner i norsk luftrom og trenger ny teknologi for å håndtere dette, sånn at det legges tilrette for et nytt kommersielt marked samtidig som vi sikrer at den tradisjonelle luftfarten videreutvikler seg i parallell.\r\n\r\nSamtidig har vi ambisjoner om å skape de beste kundeopplevelsene for våre reisende. For oss handler det først og fremst om en trygg og sikker reise, men også utvikling av digitale produkter og tjenester som skal bidra til en mer sømløs reise for deg og meg. Avinor er med andre ord mye mer enn drift av flyplassene og vi er i stadig utvikling – og det er her vi trenger hjelp fra deg! Vi er avhengig av impulser utenfra – noen som kan gi oss nye blikk på vår virksomhet og som tør å utfordre oss! Er det du som står på tur i år?\r\n\r\n## Dette får du:\r\n\r\n-   9 lærerike og spennende uker fra 10.6-9.8 med sommerfri uke 29 og 30\r\n-   Konkurransedyktig lønn\r\n-   Arbeidssted er hovedkontoret på Skøyen med sjøbadmuligheter i umiddelbar nærhet på Bygdøy\r\n-   Tett oppfølging fra dedikert veileder/prosjektleder under hele perioden\r\n-   Jobbe tverrfaglig sammen med de andre i sommerprosjektet\r\n-   Fag- og sosiale fellessamlinger med de andre sommerstudentene gjennom sommeren\r\n-   Svært relevant erfaring med tanke på videre karriere og CV- referanser\r\n-   Muligheten til å bygge nettverk internt og utvikle relasjoner med andre sommerstudenter\r\n-   Muligheten til et adrenalin kick når resultatet skal presenteres i Konsernledelsen i slutten av perioden  \r\n    \r\n\r\n## Men nok om oss - hvem er så du?\r\n\r\nVi ønsker oss deg med studieretning eller tilsvarende innenfor informatikk, datateknologi, kommunikasjonsteknologi, kunstig intelligens, tjenestedesign, industriell økonomi og som fortrinnsvis fullfører bachelor- eller mastergrad våren 2025\r\n\r\nDu er nysgjerrig på teknologi, fremoverlent og elsker å utforske nye ting. Du tør å utfordre, teste og lære underveis. Du trives med å jobbe med andre i tverrfaglige team. For å få mest mulig ut av internship perioden, bør du være nysgjerrig og engasjert i oppgavene dine, være villig til å lære og dele, og samarbeide med dine kolleger. Du kommuniserer godt på norsk og engelsk og har du erfaring fra tidligere prosjektarbeid, sommerjobber eller annen relevant deltidsjobb er det et pluss. Det viktigste for oss er likevel at du er motivert, vil ha det gøy og engasjerer deg i oppgavene.\r\n\r\nVi tar inn 8-10 studenter sommeren 2024 til 4 ulike prosjekter. Hvert prosjekt vil bestå av 2-3 studenter i tillegg til en dedikert veileder. Her får du et lite innblikk om hva prosjektene vil handle om:\r\n\r\n-   "Du vil få mulighet til å jobbe med AI og trafikksystem for droner; vi ønsker at du analyserer fremtidig systemer for drone-trafikk i norsk luftrom; hvordan kan AI omforme fremtidens drone-systemer og hvilke tjenester kan dra nytte av AI; hvordan skal datastyring i U-space utformes; hvordan kan dette revolusjonere lufttrafikken?  \r\n    \r\n\r\n-   "Vil du være med å utforme din egen passasjeropplevelse og flyt på lufthavnen? Avinor har en rekke ulike informasjonskilder og datasett tilknyttet lufthavnen - hvordan kan vi benytte disse kildene og datasettene for å gi både Avinor, aktører og/eller passasjer en digital visualisering av situasjonen på lufthavnen? I ett tverrfaglig team vil dere jobbe med innsiktsarbeid og data for å løse nettopp dette!"  \r\n    \r\n\r\n-   "Du vil få muligheten til å jobbe med et spennende prosjekt som setter søkelys på optimalisering av flygelederbemanning. Prosjektet innebærer å utforske TRAC-data, strukturere store datasett og bygge maskinlæringsmodeller som skal forbedre ressursutnyttelsen innen norsk luftfart. Dette er din sjanse til å bruke dataanalyse og maskinlæring for å bidra til en mer sikker og effektiv luftfart!"  \r\n    \r\n\r\n-   "En unik sjanse for deg som ønsker å utfordre og legge til rette for en framtidsrettet forvaltning av en teknologisk og datadrevet organisasjon! Hvem bør ta hvilket ansvar og hvordan kan eierskap rundt data, tjenester og systemer være med på å skape et framtidsrettet konsern og hva sier teorien hvordan vi bør forvalte våre prosesser med tanke på dataforvaltning i stort?"\r\n\r\nUansett hvilket prosjekt du jobber på, lover vi deg en lærerik og morsom sommer i et faglig sterkt og kreativt miljø!\r\n\r\n## Rekrutteringsprosessen\r\n\r\nKjenner du det kribler i magen når du leser dette og blir gira på noe gøy og meningsfullt sommeren 2024, klikk Søk på stillingen . I søknadsprosessen trenger du kun å laste opp din CV, karakterutskrift og svare kort på noen stillingsrelaterte spørsmål. Vær oppmerksom på at vi krever karakterutskrifter sendt inn før vi evaluerer søknaden. Hvis du er i ferd med å fullføre en grad, vennligst last opp en midlertidig karakterutskrift eller annet dokument som beskriver emner og karakterer fullført til dette punktet. Søknader som sendes inn uten nødvendige vedlegg vil dessverre ikke bli vurdert.  \r\n  \r\nVi ønsker ikke å gå glipp av den perfekte kandidaten bare fordi du kanskje mangler noen av de nevnte kvalifikasjonene. Hvem vet – kanskje du har andre ferdigheter som kan være verdifulle for oss i et av våre sommerprosjekter. Aktuelle kandidater blir kontaktet fortløpende, og intervju vil foregå på delvis på MS Teams og fysisk.  \r\nVi ser frem til å høre fra deg!\r\n\r\n## Om arbeidsgiveren\r\n\r\n**Om Avinor**\r\n\r\n  \r\n\r\n**Vi er cirka 2800 ansatte som sammen driver 43 flyplasser i Norge – og sørger for at nesten 50 millioner passasjerer kommer seg trygt opp i luften og ned igjen. De fleste nordmenn, og de som kommer på besøk til Norge tenker ikke så mye over Avinor, men bruker nesten alle tjenestene våre i forbindelse med flyreisen – og takket være disse kan vi opprettholde et stort nettverk av også mindre lønnsomme flyplasser gjennom tax free-salg, parkering og avgifter for å oppholde seg i norsk luftrom. Vi kaller dette for Avinormodellen – og den bidrar til at folk som bor i utkantstrøkene også får kort vei til jobb, sykehus, utdannelse og så videre, takket være finansiering fra de større flyplassene.**\r\n\r\n  \r\n\r\n**Avinor er en viktig brikke i å gjøre luftfarten grønnere og bærekraftig på sikt. Vi jobber tett med miljøorganisasjoner, er sentral i utviklingen av bærekraftig flydrivstoff og elektriske fly. Dette er avgjørende for vår overlevelse, og et fantastisk spennende område som omhandler innovasjon og samarbeid med mange spennende partnere. Vi sikter på å være fossilfrie innen 2030!**\r\n\r\n  \r\n\r\n**For at Avinor skal fortsette å levere tjenester og produkter i verdensklasse, må alle være med å utvikle dem. Derfor sier det seg selv at alle typer medarbeidere er ønsket hos oss, uavhengig av bakgrunn, legning, etnisitet, religion, funksjonsevne og alder. Her skal alle føle seg velkomne!**\r\n\r\n  \r\n\r\n**Avinor er underlagt offentlighetslovens bestemmelser om rett til innsyn i søkerlister. Dersom du ønsker å reservere deg fra oppføring på offentlig søkerliste, må du opplyse om dette i søknaden, med en begrunnelse for hvorfor du mener det er grunnlag for unntak. Opplysninger kan bli offentliggjort selv om du har bedt om ikke å bli oppført på søkerlisten, men du vil bli varslet dersom ønsket om reservasjon ikke tas til følge.**\r\n\r\n  \r\n\r\n**Vi gjennomfører bakgrunnssjekk av aktuelle søkere for å verifisere opplysninger som fremgår av CV, vitnemål og annen dokumentasjon. Denne bakgrunnssjekken vil kunne bli gjennomført av vår samarbeidspartner og gjennomføres ikke uten samtykke fra søkeren. Aktuelle søkere vil motta nærmere informasjon om dette.**\r\n\r\nSektor; Offentlig\r\n\r\nAntall stillinger; 10\r\n\r\nSted; Drammensveien 144, 0277 Oslo\r\n\r\nBransje; IT, IT - programvare, Luftfart, IT - maskinvare\r\n\r\nStillingsfunksjon; IT utvikling / Utvikler (generell), IT utvikling / Systemarkitekt, IT utvikling / Database\r\n\r\n## Nøkkelord\r\n\r\nInternship, Oslo, IT, Utvikling, Student',
    applicationLink: "https://www.finn.no/job/fulltime/ad.html?finnkode=322197393",
    applicationEmail: "",
    start: new Date("2023-10-02T14:16:34+02:00"),
    end: new Date("2023-11-02T23:59:59+01:00"),
    featured: false,
    deadline: new Date("2023-11-02T23:59:59+01:00"),
    deadlineAsap: false,
    employment: employments.internship,
  },
  {
    id: "01HD77R4YAYQAR9V47DA5X1Q7C",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Norkart Sommer Internship 2024",
    ingress:
      "I Norkart er du med på å digitalisere Norge – ikke i teorien – men i virkeligheten. Vi er en markedsledende system- og dataleverandør innenfor stat, kommune og næringsliv - noe som gjør at våre løsninger påvirker hverdagen til svært mange personer.",
    description:
      "## Bli med å skape smartere samfunn!\r\nI Norkart er du med på å digitalisere Norge – ikke i teorien – men i virkeligheten. Vi er en markedsledende system- og dataleverandør innenfor stat, kommune og næringsliv - noe som gjør at våre løsninger påvirker hverdagen til svært mange personer. Dette gjør at vi har et sterkt fokus på å forenkle, forbedre og fremfor alt automatisere. Sammen med innovative kunder og samarbeidspartnere – leverer vi smarte løsninger som bidrar til en enklere hverdag.\r\n\r\n**Norkart er ikke bare kart. Norkart er også kunnskap om smart forvaltning av informasjon om din og min hverdag. Hvordan vi bor, hvordan vi beveger oss, hvordan vi planlegger og hvordan vi tar vare på ressursene våre rundt oss på best mulig måte. I Norkart hjelper vi innbyggere, næringsliv, stat og kommune med å skape en enklere hverdag.**\r\n\r\nSom sommeransatt i Norkart får du en unik mulighet til å sette kunnskap og nysgjerrighet ut i praksis ved hjelp av tett veiledning og oppfølging, men også med stor grad av frihet og ansvar. Hvilken informasjon gjemmer seg i dataene og hvordan kan den skape verdi for deg, meg og samfunnet vårt? Hvordan kan vi automatisere komplekse prosesser? Hvordan kan vi utnytte våre areal på en bærekraftig måte? Hvordan kan vi forutse og kanskje også forhindre naturkatastrofer? Hvordan kan vi bruke data til maskinlæring og effektivisere manuelle operasjoner?\r\n\r\n### Ny teknologi gir uendelige muligheter\r\nSommerprosjektene i Norkart er alltid en anledning til oss å se oss selv med helt nye øyne. Som student kan du utfordre oss, forandre vårt tankesett og hjelpe oss til å se nye muligheter. Du får leke deg med ny teknologi, sette teori i praksis og lære oss mer om deg og hva du tenker om fremtidens samfunn.\r\n\r\nVåre tidligere sommerstudenter har blant annet utviklet prototyper som er tatt videre og i dag ligger i våre produktporteføljer. De har utfordret oss på arbeidsmetodikk og ideer, og de minner oss stadig på å løfte frem prosjekter som omhandler miljø og bærekraft.\r\n\r\nVisste du forresten at et av våre sommerprosjekter resulterte i løsningen for visualisering av boligsalg som i dag blir brukt av nesten alle landets nettaviser, samt 1881 og Finn.no?\r\n\r\n### I løpet av en Norkart-sommer vil du få:\r\n\r\n* Jobbe med personer fra ulike studieretninger\r\n* Ta egne teknologivalg\r\n* Muligheten til å ta ansvar og å få eierskap til prosjektet\r\n* Utvikle dine tekniske ferdigheter\r\n* Reell erfaring med prosjektarbeid i arbeidslivet\r\n* Innsikt i arbeid og kreativ prosess rundt bruk av geografisk data\r\n* God oppfølging fra dyktige utviklere hos oss\r\n\r\nSom sommerstudent hos oss jobber du i team med de andre studentene som tilhører samme arbeidssted som deg. \r\n\r\n### Du er:\r\n\r\n* Engasjert, lærevillig og selvgående\r\n* Liker å jobbe i team\r\n* Interessert og nysgjerrig på teknologi\r\n* Utvikler eller designer\r\n* Fokus på strukturert og lesbar kode\r\n\r\nVi ser etter deg som ønsker deg en utfordring sommeren 2024, og som har et brennende engasjement for teknologi, enten backend, frontend, UX/design – eller alt sammen!\r\n\r\n### Lokasjonene du kan velge mellom er:\r\n\r\n* Skøyen, Oslo\r\n* Trondheim\r\n* Lillehammer\r\n* Kristiansand\r\n\r\n### Karriere i Norkart\r\nI løpet av de siste ti årene har mange startet sin karriere i Norkart gjennom Norkart Sommer, og som medarbeider fått utvikle seg i ulike roller.\r\n\r\nVi utvikler etter et smidig tankesett og dyrker DevOps-kultur og -metodikk. Løsningene våre driftes i Azure – hvor vi nyttiggjør oss av ‘infrastructure as code’ for utrulling samt Azure sitt brede tjenestespekter for å raskt kunne levere gode og solide løsninger. Back-end bruker vi .NET Core og skriver kildekoden i C#. Front-end jobber vi med TypeScript og React. Les mer om teknologien vi bruker på **[Norkart Teknologi](https://karriere.norkart.no/departments/norkart-labs)**",
    applicationLink: "https://karriere.norkart.no/jobs/3167357-norkart-sommer-2024",
    applicationEmail: "",
    start: new Date("2023-09-18T23:59:59+02:00"),
    end: new Date("2023-11-05T23:59:59+01:00"),
    featured: false,
    deadline: new Date("2023-11-05T23:59:59+01:00"),
    deadlineAsap: false,
    employment: employments.internship,
  },
  {
    id: "01HD77R4YAW54151ZE3ABZVGSX",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Software Engineering Summer Internship",
    ingress: "Are you our new Software Engineering Intern?",
    description:
      "**Are you our new Software Engineering Intern?**\r\n\r\nCisco Norway is a global leader in developing video conferencing technology - helping millions of people connect and collaborate around the world. At our development center outside Oslo, we have 350 engineers working with hardware and software - from idea to design, mechanics, audio, media processing and artificial intelligence. Our solutions are used by small businesses and large corporations, universities, governments, and international organizations.  \r\n  \r\n\r\nWe are looking for our new  **Software Engineering Summer Interns** to join us Summer 2024.  \r\n  \r\n\r\n**What you will do:**\r\n\r\nDuring a summer internship you will get the opportunity to explore a variety of technologies, while working together with an existing team. It is important for us that our summer interns feel included and that they get to work on real life projects that are relevant and useful to us.\r\n\r\nThe project you will be working on will be decided based on your field of interest and our current needs. If you have a great idea, you might even get the opportunity to pursue this during your internship. The following examples are projects that previous interns have been working on:\r\n\r\n-   real-time multi head pose detection\r\n-   improving the microphone beam selector using deep learning\r\n-   office room analytics application based on live and historical sensor data from our devices\r\n-   noise reduction with deep learning\r\n-   synchronous camera focusing for immersive systems\r\n-   showing personal calendars in meeting rooms based on face recognition\r\n-   using Falco on Kubernetes for threat detection\r\n\r\n**Who are you?**\r\n\r\nMore important than your track-record, is your commitment, curiosity, and willingness to learn. We are looking for people who want to become an expert in their field through working with us. To succeed, you also need to be a team player. We need to combine our brains, competences, and expertise to deliver top of the shelf products.\r\n\r\nIn addition, do you:\r\n\r\n-   study towards a master’s or bachelor´s degree in a related subject?\r\n-   have an interest in programming and development?\r\n-   have a willingness to learn new skills and broaden your knowledge?\r\n-   have the ability to live and work in Norway?\r\n\r\n**Why us?**\r\n\r\nOur people are the driving force behind our success and innovations – constantly challenging the way we work, live, play and learn. We depend on our people’s creativity and ability to solve interesting problems, while making sure they are maintaining a healthy work-life balance. At Cisco Norway we strive to build an inclusive culture where we can grow and excel together.\r\n\r\nWe are also proud to be #1 in Fortune 100 Best Companies to work for in 2022, and #1 Norway’s Best Workplace in 2023. We can offer you:\r\n\r\n-   a fun summer with a competitive salary, and real-life projects that are important to Cisco.\r\n-   challenging and interesting tasks that are relevant to your education and creativity.\r\n-   a Cisco Fun group – dedicated to creating social activities and great memories\r\n-   a Cisco Play group – that organizes team sports, yoga and weekly bootcamps at our in-house fitness center  \r\n    - and of course, free ice cream on warm summer days!\r\n\r\n_  \r\n“The best about being an intern in Cisco was the opportunity to get to know Cisco and all the inspiring and engaging people who works there. In addition to exciting tasks and lots of fun, I felt as I was a part of a big family for a summer.”_ – Previous Intern, Kari Mo\r\n\r\n**Duration:** Mid-June – Mid-August 2024\r\n\r\n**Application deadline**: 31 October 2023\r\n\r\n  \r\n**Upon applying, please upload your cover letter, CV and university grade transcript.**",
    applicationLink: "https://jobs.cisco.com/jobs/IsAJob?projectId=1408849&source=Other+Job+Posting&tags=online2023",
    applicationEmail: "",
    start: new Date("2023-09-14T12:00:00+02:00"),
    end: new Date("2023-10-31T23:59:59+01:00"),
    featured: false,
    deadline: new Date("2023-10-31T23:59:59+01:00"),
    deadlineAsap: false,
    employment: employments.internship,
  },
  {
    id: "01HD77R4YAQXGEH10C4XTT8J5K",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Associate Solutions Engineer - Norway",
    ingress: "Are You Our New Associate Solution Engineer?",
    description:
      '**Training Hub Location**: Amsterdam, Netherlands\r\n\r\n**Location After Training**: Lysaker, Norway\r\n\r\n**Start date:** 28th July 2024  \r\n  \r\n\r\n**What You’ll Do:**\r\n\r\nCisco Sales Associates Program offers a global environment that provides structured training and on-the-job-experience. We will develop your technical, sales and communication skills and give the opportunity to rotate through a variety of areas based on our model of Education Exposure Experience. You will learn how to position Cisco’s architectures, solutions and products to our customers.\r\n\r\n  \r\n\r\nYour career will continue in a sales engineering role as part of Cisco’s Global Virtual Engineering (GVE) Team. GVE is a technical presales organisation, that provides software and systems engineering services to customers, partners, and internal Cisco sales employees. As a sales engineer, you’ll discover, demonstrate and design solutions by engaging with our customers and partners to bring simple solutions to their complex challenges.\r\n\r\nFrom there, your career can develop and grow into a variety of sales opportunities at Cisco.  \r\n  \r\n\r\nWhile challenging, it will push you to become the best version of yourself. You will achieve industry-standard certifications, as part our perpetual learning approach, and be assessed and mentored through customer simulations and on-the-job activities. We’ll offer you a safe and fun environment to practice what you’ve learnt, all the while providing you with feedback to develop your potential.\r\n\r\n**Who You\'ll Work With:**\r\n\r\nYou’ll be part of CSAP, an award-winning and industry recognised early-in-career development program for top university graduates from around the world. You’ll train alongside incredibly hardworking individuals, like yourself, from different countries and diverse backgrounds. Early on, you’ll make long-lasting friendships and belong to a rich human network that will support you throughout your career.\r\n\r\n  \r\n\r\nAs a successful Associate Solutions Engineer (ASE), you’ll expand your software and networking knowledge to collaborate with Cisco sales professionals and provide technical solutions that drive business outcomes for our customers and partners.\r\n\r\nYou’ll learn from experts and coaches in an unrivalled setting using our own leading-edge technology. You’ll have your own mentor, a CSAP alumnus who’s been in your shoes and will help guide you in your first year. With a strong Cisco team committed to your success, you’ll gain hands-on education and experience, while receiving an attractive salary and pursuing your career dreams!\r\n\r\n**What we offer**\r\n\r\nAt Cisco, we strongly believe in the wellbeing of our employees and work life balance, and our benefits package is designed to reflect this. On top of your remuneration package and 25 days holiday, you may be entitled to receive these  [**Benefits & Perks**](https://www.cisco.com/c/en/us/about/careers/we-are-cisco/benefits-and-perks.html#~stickynav=5)  as part of our People Deal and benefits package.\r\n\r\n**Who You Are:**\r\n\r\n-   Recent graduate or on your final year of studies towards a degree or related program or other academic certification in any of the STEM subject areas ideally with an emphasis on networking and computing\r\n-   Fluent in English and Norwegian\r\n-   Be willing to relocate to Norway, upon graduating from the program\r\n-   Willing to relocate for 12 months to a designated CSAP training hub as required. Immigration and relocation support will be provided should the program be delivered in training hubs as opposed to virtually.\r\n-   Technology enthusiast who enjoys innovating ideally with a demonstrated passion and interest in software languages, such as Java or Python\r\n-   Demonstrate an eagerness to establish a long-term Sales career with Cisco Norway.\r\n-   Must be able to legally live and work in Norway, without visa support or sponsorship (student visas or visas obtained on your own are not applicable for the program)\r\n\r\n  \r\n**Why Cisco**\r\n\r\nCisco is an Equal Opportunity Employer and you will receive consideration for employment without regard to race, color, religion, gender, sexual orientation, national origin, genetic information, age, disability, or any other legally protected basis.\r\n\r\n  \r\n#WeAreCisco, where each person is unique, but we bring our talents to work as a team and make a difference powering an inclusive future for all.\r\n\r\nWe embrace digital, and help our customers implement change in their digital businesses.\r\n\r\nBut "Digital Transformation" is an empty buzz phrase without a culture that allows for innovation, creativity, and yes, even failure (if you learn from it.)\r\n\r\n  \r\nDay to day, we focus on the give and take. We give our best, give our egos a break, and give of ourselves (because giving back is built into our DNA.) We take accountability, bold steps, and take difference to heart. Because without diversity of thought and a dedication to equality for all, there is no moving forward.\r\n\r\n  \r\nCisco are always looking to identify talented people. If you are reading this posting then we may not have an open job right now, however it is highly likely we will in the future. If you are interested in working for Cisco in this capacity then please submit your details and CV or resume against this requisition so that when a suitable vacancy arises a Cisco representative can contact you directly.\r\n\r\n  \r\nPlease note that vacancies will be filled on a rolling basis after opening and we will close applications as offers are accepted; possibly before the stated deadline. Therefore, we highly recommend you submit your application as early as possible in order to be considered for the opportunity of your choice.',
    applicationLink: "https://jobs.cisco.com/jobs/IsAJob?projectId=1409014&source=Other+Job+Posting&tags=online2023",
    applicationEmail: "",
    start: new Date("2023-09-14T12:00:00+02:00"),
    end: new Date("2023-11-30T23:59:59+01:00"),
    featured: false,
    deadline: new Date("2023-11-30T23:59:59+01:00"),
    deadlineAsap: true,
    employment: employments.fulltime,
  },
  {
    id: "01HD77R4YA5CA0QYF0PEBGZNGZ",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Graduate Software Engineer - Norway",
    ingress: "Are You Our New Graduate Software Engineer?",
    description:
      "**Are You Our New Graduate Software Engineer?**\r\n\r\nCisco Norway is a global leader in developing video conferencing technology - helping millions of people connect and collaborate around the world. At our development center outside Oslo, we have 350 engineers working with hardware and software - from idea to design, mechanics, audio, media processing and artificial intelligence. Our solutions are used by small businesses and large corporations, universities, governments, and international organizations.\r\n\r\nWe are now looking for  **Graduate Software Engineers** to join our team.  \r\n  \r\n\r\n**What You Will Do:**\r\n\r\nYour role will evolve as you get to know us better, and we encourage you to try out and experience different teams and tasks. Our goal is to make sure you reach your full potential, so we together can drive cutting-edge innovation and develop the best possible products. At Cisco you will receive a mentor to guide you along the way and answer all your questions.  \r\n  \r\n\r\n**In this role you will have the opportunity to:**\r\n\r\n-   join different teams in search of your perfect spot.\r\n-   apply all your creativity and knowledge to the quest to create great video conferencing solutions.\r\n-   be a part of one of the largest tech companies in the world.\r\n-   attend national and international courses, seminars, conferences, and workshops to stay up to date and learn new skills.  \r\n      \r\n    \r\n\r\n**Who Are You?**\r\n\r\nMore important than your track-record, is your commitment, curiosity, and willingness to learn. We are looking for people who want to become an expert in their field through working with us. To succeed, you also need to be a team player. We need to combine our brains, competences, and expertise to deliver top of the shelf products.  \r\n  \r\n\r\n**In addition, do you have:**\r\n\r\n-   a relevant bachelor’s or master’s degree, or adequate experience? Relevant degrees might be computer science, computer engineering, informatics, electrical engineering, or a related subject such as math or physics.\r\n-   an interest in programming and development?\r\n-   a willingness to learn new skills and broaden your knowledge?\r\n-   ambition, both on behalf of yourself and your product?\r\n-   the magic combination of creativity and thoroughness?\r\n\r\n**Why us?**\r\n\r\nOur people are the driving force behind our success and innovations – constantly challenging the way we work, live, play and learn. We depend on our people’s creativity and ability to solve interesting problems, while making sure they are maintaining a healthy work-life balance. At Cisco Norway we strive to build an inclusive culture where we can grow and excel together.\r\n\r\nWe are also proud to be #1 in Fortune 100 Best Companies to work for in 2022, and #1 Norway’s Best Workplace in 2023. In addition to a competitive salary, insurance, and other benefits, we offer:\r\n\r\n-   a Cisco Fun group – dedicated to creating social activities and great memories\r\n-   a Cisco Play group – that organizes team sports, yoga and weekly bootcamps at our in-house fitness center – to strengthen your body and relieve your stress\r\n-   six weeks holiday – to make sure you’re well rested\r\n-   up to 5 (paid) days for volunteer work – to make the world a better place\r\n-   a day off on your birthday – because you deserve it\r\n-   a Green Settle-in Bonus of 10.000 NOK. ­– to give you a healthy and sustainable start to your new role.\r\n-   and of course, office barista and free ice cream on warm summer days!  \r\n      \r\n    \r\n\r\n**Start date:** August 2024  \r\n\r\n**If this sounds like a good fit, we are eager to hear from you!  \r\n  \r\n  \r\nUpon applying please upload your cover letter, CV and university grade transcript.**",
    applicationLink: "https://jobs.cisco.com/jobs/IsAJob?projectId=1408850&source=Other+Job+Posting&tags=online2023",
    applicationEmail: "",
    start: new Date("2023-09-12T12:00:00+02:00"),
    end: new Date("2023-10-31T23:59:59+01:00"),
    featured: false,
    deadline: new Date("2023-10-31T23:59:59+01:00"),
    deadlineAsap: true,
    employment: employments.fulltime,
  },
  {
    id: "01HD77R4YAZN6ABDPB17K52NAH",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Form din fremtid gjennom internship i Deloitte Consulting",
    ingress:
      "Er du student og ønsker kompetanseheving og verdifull praksis for fremtiden? Da vil vi oppfordre deg til å søke internship hos oss i Consulting!",
    description:
      "## Beskrivelse av bedriften\r\nDeloitte leverer tjenester innen spesialiserte fagfelt vi behersker til fingerspissene; revisjon, advokattjenester, finansiell rådgivning, risikoanalyser og konsulenttjenester. Med over 415,000 kolleger i ryggen ser vi verden fra ulike vinkler og skaper verdier på tvers av landegrenser, bransjer, ekspertise, innsikt og generasjoner. Med kunnskapen dette gir oss, bidrar vi til å ruste kundene våre for morgendagens utfordringer. Sammen skaper vi resultater. \r\n\r\n**Consulting** består av ca. 500 engasjerte medarbeidere som tilbyr konsulenttjenester til nasjonale og internasjonale selskaper, innenfor både det offentlige og private. Vi hjelper våre kunder med å transformere deres virksomhet og sikre bærekraftig vekst. Vi tilbyr et bredt spekter av variasjoner når det gjelder kompetanseområder, bransjespesialiteter og prosjekttyper. \r\n\r\n## Jobb-beskrivelse\r\n*Er du student og ønsker kompetanseheving og verdifull praksis for fremtiden? Da vil vi oppfordre deg til å søke internship hos oss i Consulting!*\r\n\r\nEr du kreativ og spontan? Eller analytisk og reflekterende? Kanskje er du til og med begge deler, eller noe midt imellom? Uansett hvilke personlige egenskaper du kjenner deg igjen i, ser vi alltid etter folk som er like forskjellige som utfordringene vi jobber med å løse. Vi har nemlig lært at ingenting er umulig med de rette folka – altså de som er med på å oversette kompliserte problemstillinger til konkrete tiltak hver eneste dag i Deloitte.  \r\n\r\nVi ser etter deg som studerer økonomi, business, teknologi eller IT, og som ønsker å bidra til å effektivisere morgendagens arbeidsplass. Gjennom internship i Consulting vil du få mulighet til å arbeide med blant annet programmering, fordype deg i applikasjoner, ERP- og CRM-systemer, strategiutvikling og effektivisering av økonomifunksjonen. Vi etterstreber å matche prosjekt og arbeidsoppgaver i internship-programmet med din utdanningsbakgrunn og interesser. Ofte vil prosjektene i Consulting være tverrfaglige, der du får muligheten til å arbeide sammen med studenter med en annen utdanningsbakgrunn enn deg selv.    \r\n\r\n## Hva er Deloitte internship?  \r\n\r\nHva gjør en konsulent i Deloitte? Hvordan skaper vi verdi for kundene våre og hvordan ser en typisk arbeidshverdag ut? Og hvordan er det egentlig å jobbe i et markedsledende selskap? Dette er kun et knippe av spørsmålene du vil få svar på gjennom et internship hos oss.  \r\n\r\nGjennom vårt internship-program vil du få et solid innblikk i hva det vil si å være en ekte «Deloitter». Du vil få muligheten til å jobbe i team på reelle prosjekter hos våre kunder med konkrete problemstillinger, og avslutningsvis presentere og videreformidle resultatet. Du vil få tett oppfølging i hele perioden – blant annet gjennom en tildelt fadder, coach og prosjektleder, som du kan sparre med underveis. Et internship i Deloitte er en ypperlig mulighet til å bygge kompetanse, knytte relasjoner, sette teori ut i praksis, og ikke minst – utfordre deg selv.\r\n\r\n## Hvorfor velge internship hos oss? \r\nEr det én ting vi har lært, så er det at det vi får mest igjen for, er å investere i folka som jobber her. De som jobber hos oss, får rom til å utvikle seg i et sterkt fagmiljø med mange av de fremste på sitt felt. På denne måten blir de rustet til å hjelpe bedrifter med å innføre konkrete tiltak som faktisk utgjør en forskjell. Internship i Deloitte er et ettertraktet program, og et lærerikt tilskudd til utdannelsen din. I tillegg gir det deg:  \r\n\r\n- Erfaring fra arbeidslivet gjennom virkelige hendelser og prosjekter.  \r\n- Et unikt nettverk i Deloitte og hos våre kunder.  \r\n- En spennende CV med relevant arbeidserfaring fra et av verdens største selskaper. \r\n- En «ut av komfortsonen»-opplevelse.   \r\n- Mulighet for tilbud om fast jobb i Deloitte. \r\n\r\nGjennom vårt internship vil du få være med å utfordre det etablerte og løse dagens og morgendagens samfunnsutfordringer. Hvis du ønsker faglige utfordringer, lære av erfarne kolleger, samt utvikle deg som person, er Deloitte stedet for deg. \r\n\r\n## Kvalifikasjoner\r\nSom intern i Deloitte tror vi at du har:\r\n\r\n- Relevant utdanningsbakgrunn\r\n- Vist et stort engasjement og initiativ i løpet av studietiden gjennom f.eks. verv eller annen arbeidserfaring.  \r\n- Motivasjon for å lære, integritet og tar ansvar for at det du leverer er av høy kvalitet. \r\n\r\nInternship i Consulting er tilgjengelig sommeren 2024 og er for deg som har startet på en økonomi-/business- og/eller teknologirettet mastergrad (4. klasse). **Vi søker interns til våre kontorer i Oslo, Bergen og Stavanger.** Summer Internship har oppstart i midten av juni og varer til og med midten av august. Det legges opp til tre uker ferie i juli. \r\n\r\n## Ytterligere informasjon\r\n**Hvordan søker jeg?**\r\nSøk via LinkedIn eller manuell registrering. Husk å laste opp CV, søknadsbrev og vitnemål fra høyere utdanning. Hold av uke 45 til eventuelle intervjuer. Rekrutteringsprosessen vil være heldigital.\r\n\r\nVi vurderer søknader fortløpende, og oppfordrer derfor til å søke så snart som mulig. Alle søknader blir lest, og vi gleder oss til å lese DIN!\r\n\r\n**Søknadsfrist:** 01.11.2023 kl. 23:59\r\n\r\n**Arbeidssted:** Oslo/Bergen/Stavanger\r\n\r\nOppstart: Juni 2024\r\n\r\nKontakt: For spørsmål om rekrutteringsprosessen kan du ta kontakt med Andreas Elstrøm | People & Purpose, e-post: [aelstrom@deloitte.no](mailto:aelstrom@deloitte.no)\r\n\r\n*Du får muligheten til å jobbe i et selskap som hjelper andre aktører med sin grønne omstilling, samtidig som vi arbeider målrettet med egne ambisjoner innenfor både klima og miljø og samfunnsansvar. Som ansatt i Deloitte integreres bærekraft i arbeidshverdagen, og du får du anledning til å bidra i ulike prosjekter og initiativer knyttet til dette.*\r\n \r\n*Som samfunnsaktør, arbeidsgiver og tjenesteleverandør har Deloitte et stort fokus på mangfold og inkludering. Vi ser at ulike perspektiver fremmer nytenkning, gir dypere innsikt og bedre beslutninger, og ikke minst mobiliserer potensialet til medarbeiderne våre! Vi ønsker derfor et stort mangfold blant søkere. *",
    applicationLink: "https://jobs.smartrecruiters.com/DeloitteNordic/743999929321173",
    applicationEmail: "",
    start: new Date("2023-09-10T15:48:21+02:00"),
    end: new Date("2023-11-02T00:00:00+01:00"),
    featured: false,
    deadline: new Date("2023-11-01T23:59:59+01:00"),
    deadlineAsap: false,
    employment: employments.internship,
  },
  {
    id: "01HD77R4YAMPR4PG0GSYBM9Y32",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Summer Internship 2024 - AI and Product Development",
    ingress:
      "Aneo is a renewable energy company with headquarters in Trondheim, established in 2022 by TrønderEnergi and HitecVision. Aneo invests heavily in wind power, solar power, electrification and energy efficiency in the Nordic region.",
    description:
      "**Artificial intelligence (AI) and software development** play key roles in the necessary renewable energy transition due to the increasing need for **automation** and **data-driven** decision making. Therefore, Aneo has an AI and product development department dedicated to developing and maintaining systems for **forecasting**, **optimization**, **simulation**, and **control** of energy infrastructure including wind turbines, hydropower plants, construction sites, EV chargers and buildings. The department is a cross-disciplinary and international team, with strong backgrounds in **machine learning**, **operations research**, and **software development**. The team works full stack, from understanding **business needs** and **data analysis** in **Python** to deploying AI systems in production, setting up necessary **DevOps** and **cloud** infrastructure, and creating **user interfaces**.\r\n\r\nAs a summer intern at AI and Product Development, you will work in groups of 2-3 students on real-world problems related to the topics mentioned above, in close collaboration with both other students and full-time employees.\r\n\r\nAll summer students at Aneo will participate in our summer student program, which includes introductions to the power industry and social events throughout the summer. Additional social events are organized by [WorkationTrd](https://www.workationtrd.no/), where you also meet interns from other companies in Trondheim.\r\n\r\n## **What we look for:**\r\n\r\n- Someone with an interest in using AI and/or programming to solve problems in the energy industry.\r\n- Programming experience, preferably in Python.\r\n- A team player, who contributes to a good working environment.\r\n- We mainly look for master students in their 2nd to 4th year or PhD-level, but we are open to considering candidates from other years with a high motivation and interest within renewables, programming and/or AI.\r\n\r\n## **Application details:**\r\n\r\n- Application deadline: 12th of November. We may interview and hire candidates before this date, so early applications are encouraged.\r\n- Application should preferably be in English and include:\r\n    - Cover letter (½-1 page)\r\n    - CV\r\n    - Transcript of records\r\n    - Recommendation letter (not mandatory)\r\n- Beneficial but not required to include:\r\n    - A list of relevant AI and/or programming experience, e.g., courses (including current and next semester), projects, or hobby projects.\r\n    - Indication of your knowledge of Python and version control\r\n    - A list of any other relevant skills (e.g., optimization, statistics, control systems, deployment of software, UX, frontend)\r\n\r\nConsistent with our policies, conducting a background check is required for this position.\r\n\r\n**We are looking forward to receiving your application! If you have any questions or need further information, please don't hesitate to reach out to us.**",
    applicationLink: "https://201607.webcruiter.no/Main/Recruit/Public/4705302760?link_source_id=0",
    applicationEmail: "",
    start: new Date("2023-09-10T11:09:34+02:00"),
    end: new Date("2023-11-12T23:59:59+01:00"),
    featured: false,
    deadline: new Date("2023-11-12T23:59:59+01:00"),
    deadlineAsap: false,
    employment: employments.internship,
  },
  {
    id: "01HD77R4YA6AH85A2EZ0BJP4MN",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Nyutdannet innen IT høsten 2024 og vil jobbe med Software Development?",
    ingress:
      "Ønsker du å bli en del av et felleskap med unge og engasjerte talenter som vil bygge en spennende karriere innen IT? Da er Ignite-programmet til Capgemini det perfekte starten for deg!",
    description:
      "Ønsker du å bli en del av et felleskap med unge og engasjerte talenter som vil bygge en spennende karriere innen IT? Da er Ignite-programmet til Capgemini det perfekte starten for deg! Som Igniter vil du få muligheten til å delta i spennende kundeprosjekter, lære av erfarne konsulenter og utvikle deg innenfor Systemutvikling. \r\n\r\n**Om Capgemini og Ignite-programmet:**\r\n\r\nCapgemini er et ledende konsulentselskap som jobber med å omstille industrier, effektivisere samfunnskritiske tjenester og ta i bruk ny teknologi for en bærekraftig fremtid. Vi jobber blant annet med å transformere oljeindustrien til grønn energi, forbedre helsevesenet og sikre tryggere veier gjennom digitalisering og innovasjon.\r\n\r\n**Ignite** er vårt skreddersydde utviklingsprogram for nyutdannede IT-studenter som ønsker å kickstarte sin karriere som konsulent og varer i 12 måneder. Vi tilbyr deg en unik mulighet til å kombinere praktisk arbeid på spennende kundeprosjekter med et omfattende faglig tilbud av relevante kurs og sertifiseringer. Gjennom Ignite-programmet får du virkelig oppleve hva det vil si å være konsulent, utvikle en bred forståelse av bransjen og utforske ulike karriereveier innenfor Capgemini.\r\n\r\n**Nå søker vi nyutdannede til Ignite-programmet innenfor Java, .NET og JavaScript**\r\n\r\nCapgemini er ett av de største fagmiljøene innen systemutvikling og skytjenester. Våre konsulenter jobber i store og små prosjektteam som hjelper våre kunder med digitaliseringsprosessen fra idé til ferdig produkt. Nyutdannede får muligheten til å lære av erfarne utviklere og løsningsarkitekter.\r\n\r\nVi jobber med de mest moderne teknologiene og du får mulighet til å spesialisere deg innen mange teknologier som:\r\n- JVM/ Java/Kotlin/Scala med mer.\r\n- .NET/C#/F#.\r\n- Javascript/React/Angular/Vue etc.\r\n- Skyplattformer som Azure/AWS/GCP\r\n\r\n**Hvem er du:**\r\n\r\n- Bachelor/mastergrad utdannelse innen IT\r\n- Motivasjon, entusiasme og interesse for teknologi\r\n- Fleksibel og liker å jobbe i team\r\n- Gode kommunikasjonsevner både skriftlig og muntlig (norsk og engelsk)\r\n\r\n**Hvorfor søke Capgemini?**\r\n\r\nCapgemini er ikke et vanlig konsulenthus. Vi er troverdige partnere som bistår bredt innen alt fra utvikling til ledelse, og vi gjør store komplekse løft fra on-prem til sky. Som Igniter er du et talent som vi satser på, og vi tilbyr gode karriere- og utviklingsmuligheter med masse læring underveis. Hos oss blir du dyktig i faget og får både sertifiseringer, kurs og fagsamlinger.\r\n\r\nNår vi ikke driver med fag så spiller vi brettspill, deltar på idrettslaget eller møtes over noe kaldt i glasset. Vi er gamere, musikere, fotballspillere, samfunnsengasjerte og mye mer; som ett av landets største konsulenthus finner du mange kollegaer med de samme interessene som deg.\r\n\r\n**Høres dette spennende ut? Søk nå og bli en del av Ignite-programmet hos Capgemini i 2024!**\r\n\r\nVi ser frem til å møte deg og hjelpe deg med å forme din karriere innen IT-konsulentbransjen og Capgemini. Søknadsfrist er **31 oktober.**\r\n\r\nSøk her: [Graduate 2024 - Software Development](https://emp.jobylon.com/jobs/197989-capgemini-norge-as-nyutdannet-hosten-2024-software-development/) \r\n\r\nVed søknaden ønsker vi at du legger ved CV, søknadsbrev, karakterutskrift og eventuelle attester. \r\n\r\nI vår rekrutteringsprosess vil du bli spurt om å ta en test når du søker og den vil bli tatt med i vurderingen. Alle søkere må gjennomføre denne for å bli evaluert.\r\n\r\n*Interessert i å bli bedre kjent med oss? Besøk bloggen vår [her](https://itpraten.no).*",
    applicationLink:
      "https://emp.jobylon.com/jobs/197989-capgemini-norge-as-nyutdannet-hosten-2024-software-development/",
    applicationEmail: "",
    start: new Date("2023-08-28T19:44:43+02:00"),
    end: new Date("2023-10-31T23:59:59+01:00"),
    featured: false,
    deadline: new Date("2023-10-31T23:59:59+01:00"),
    deadlineAsap: false,
    employment: employments.fulltime,
  },
  {
    id: "01HD77R4YCTMJ7XPRHCEDQ616B",
    companyId: "01HB64TWZJD1F83E5XNB96NF2R",
    title: "Kickstart karrieren som konsulent i twoday",
    ingress:
      "I twoday kan du starte karrieren som fast ansatt sammen med en håndplukket gjeng.\r\nMålet er å få deg raskt ut på prosjekt – parallelt med spennede kurs, fagkvelder, reiser\r\nog mye sosialt.",
    description:
      "I twoday kan du starte karrieren som fast ansatt sammen med en håndplukket gjeng.\r\nMålet er å få deg raskt ut på prosjekt – parallelt med spennede kurs, fagkvelder, reiser\r\nog mye sosialt. Gjennom vårt skreddersydde opplæringsprogram og veiledning fra våre\r\nerfarne konsulenter, leverer våre traineer raskt på toppnivå og skaper konkrete resultater\r\nfor kunder.\r\n\r\n**En spennende start på arbeidslivet**\r\n\r\nNytt Krutt perioden kickstartes med kurs og opplæring innen relevante teknologier. I\r\nløpet av det første året får du også reise på tur til flere av våre kontorer for å møte alle\r\ntwodays graduates, og få spennende faglig påfyll. I fjor gikk turene til Stockholm, Oslo\r\nog København.\r\n\r\n**Gjør en forskjell i sentrale norske virksomheter**\r\n\r\nSom konsulent får du et unikt innblikk i ulike bransjer og lærer mange forskjellige\r\nteknologier. Du har muligheten til å påvirke egen hverdag, og får en bratt læringskurve\r\nog mange utfordringer. Vår ambisjon er å skape stolte øyeblikk, så hos oss vil du møte\r\nengasjerte kolleger som alltid tar ansvar og strekker seg litt lenger for å levere over\r\nforventning.\r\n\r\n**twoday handler om mennesker**\r\n\r\nVi er opptatte av å skape et godt samhold mellom våre nyansatte. Du vil også raskt bli\r\ngodt kjent med erfarne kollegaer gjennom et bredt utvalg av sosiale og faglige\r\naktiviteter.\r\n\r\nÅ være markedsledende på engasjement og å ha en kultur hvor du blir sett, hørt og\r\nsatset på, ligger i ryggmargen til twoday. Det er ikke uten grunn at “hjerte” er en av våre\r\nverdier. Hos oss bygger vi hverandre opp og heier på hverandre. Lagånd står sterkt hos\r\noss, og vi jobber derfor i team hvor du alltid har en god kollega å ta en kaffekopp med\r\neller spørre om råd.\r\n\r\nVi behandler søknader fortløpende. Alt du trenger å gjøre for å søke er å laste opp CV og\r\nkarakterutskrift, søknadsbrev er valgfritt. Benytt gjerne integrasjonen med Vitnemålsportalen\r\nfor karakterutskriften din.\r\n\r\nØnsker du å høre mer om stillingen eller har du spørsmål så er det bare å ta kontakt med\r\nÅsne Stige på asne.stige@twoday.com",
    applicationLink: "https://www.twoday.no/jobb-hos-oss/nytt-krutt",
    applicationEmail: "",
    start: new Date("2023-08-24T11:40:36+02:00"),
    end: new Date("2024-02-02T14:37:17+01:00"),
    featured: false,
    deadline: null,
    deadlineAsap: false,
    employment: employments.fulltime,
  },
]

export const jobListingLocation: Insertable<Database["jobListingLocation"]>[] = [
  {
    jobListingId: "01HD77R4Y4S3WJ44NZ8029VP4P",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4Y4S3WJ44NZ8029VP4P",
    location: "Trondheim",
  },
  {
    jobListingId: "01HD77R4Y4S3WJ44NZ8029VP4P",
    location: "Tromsø",
  },
  {
    jobListingId: "01HD77R4Y764E5Q5DY9YTT9ZF6",
    location: "Trondheim",
  },
  {
    jobListingId: "01HD77R4Y7RHCCQ5SYN31CVFRG",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4Y7XW6S2VBTPBJWMTN0",
    location: "Bodø",
  },
  {
    jobListingId: "01HD77R4Y9HFYK1NJV8SKSPKN3",
    location: "Fredrikstad",
  },
  {
    jobListingId: "01HD77R4Y9D8FJ8WHBY6GF67AW",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4Y998QA09CMCAJKGSD7",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4YAYQAR9V47DA5X1Q7C",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4YAW54151ZE3ABZVGSX",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4YAQXGEH10C4XTT8J5K",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4YA5CA0QYF0PEBGZNGZ",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4YAZN6ABDPB17K52NAH",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4YAMPR4PG0GSYBM9Y32",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4YA6AH85A2EZ0BJP4MN",
    location: "Oslo",
  },
  {
    jobListingId: "01HD77R4YCTMJ7XPRHCEDQ616B",
    location: "Oslo",
  },
]
