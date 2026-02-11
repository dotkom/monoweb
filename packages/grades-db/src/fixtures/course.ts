import type { Prisma } from "../generated"

export const getCourseFixtures = () =>
  [
    {
      id: "11111111-1111-1111-1111-111111111111",
      code: "TDT4100",
      norwegianName: "Objektorientert programmering",
      englishName: "Object-Oriented Programming",
      credits: 7.5,
      studyLevel: "FOUNDATION",
      gradeType: "LETTER",
      firstYearTaught: 2007,
      lastYearTaught: null,
      content:
        "Grunnleggende algoritmer og datastrukturer, konstruksjoner og kontrollflyt i objektorienterte språk. Modularisering og gjenbruk. Standard programvarebibliotek. Enhetstesting, feilfinning og verktøy for dette. Objektorientert design. Bruk av klasse-, objekt-, sekvens- og samhandlingsdiagrammer i UML. Bruk av design patterns. Enkel app-arkitektur med moderne GUI-toolkit. Java brukes som implementasjonsspråk.",
      learningOutcomes: `Kunnskap: Studentene skal ha kunnskap om de viktigste begrepene og mekanismene i objektorienterte språk og om hvordan objektorienterte programmer og enkle apps struktureres og testes.

Ferdigheter: Studentene skal få ferdigheter i objektorientert programmering og bruk av relevante programmeringsmetoder (koding, testing og feilfinning) og moderne utviklingsverktøy.

Kompetanse: Studentene skal kunne bruke objektorientert programmering for å løse praktiske problemer og utnytte mulighetene i moderne utviklingsverktøy.`,
      teachingMethods:
        "Forelesninger, øvingsforelesninger, øvinger (individuelt eller i par) og prosjektarbeid individuelt eller i grupper.",
      examType: "Skriftlig skoleeksamen",
      studentCount: 850,
      averageGrade: 3.7,
      passRate: 81,
      campuses: ["TRONDHEIM"],
      taughtSemesters: ["SPRING"],
      teachingLanguages: ["NORWEGIAN"],
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      code: "MDV6410",
      norwegianName: "Selvmordsforebygging",
      englishName: "Suicide Prevention",
      credits: 7.5,
      studyLevel: "MASTER",
      gradeType: "PASS_FAIL",
      firstYearTaught: 2019,
      lastYearTaught: null,

      content:
        "Emnet omhandler ulike måter suicidalitet kan forstås på, med tilhørende implikasjoner for selvmordsforebyggende arbeid. Ulike forståelser vil belyses ut fra teori, forskning og førstepersonsperspektiver, og en rekke forebyggingsstrategier og -tiltak vil gjennomgås. Kritisk refleksjon omkring kunnskapsgrunnlaget for etablerte «sannheter» på fagfeltet vil stå sentralt. Holdningsmessige og etiske problemstillinger knyttet til selvmordsforebygging vil være et gjennomgående tema. En oversikt over epidemiologiske forhold vil også inngå.",

      learningOutcomes: `En kandidat med fullført kvalifikasjon skal ha følgende totale læringsutbytte definert i kunnskap, ferdigheter og generell kompetanse:

Kunnskap

Etter fullført og bestått MDV6410 skal studenten kunne:
- ha avansert kunnskap om ulike måter suicidalitet kan forstås på, samt aktuelle selvmordsforebyggende strategier og tiltak.
- ha inngående kunnskap om holdningsmessige og etiske problemstillinger knyttet til selvmordsforebygging.
- ha inngående kunnskap om fagområdets epidemiologi.

Ferdigheter

Etter fullført og bestått MDV6410 skal studenten kunne:
- bruke relevante metoder for å utarbeide og iverksette adekvate selvmordsforebyggende tiltak.
- analysere og reflektere kritisk omkring eksisterende selvmordsforebyggende strategier og tiltak.

Generell kompetanse

Etter fullført og bestått MDV6410 skal studenten kunne:
- anvende sine kunnskaper og ferdigheter om av hva suicidalitet kan handle om, slik at man kritisk kan vurdere eksisterende selvmordsforebyggende strategier og tiltak og kunne bidra til å utarbeide og iverksette (nye) slike.`,

      teachingMethods: `Forelesninger, gruppearbeid, plenumsdiskusjoner. Obligatorisk tilstedeværelse alle undervisningsdager.

Undervisningen foregår i samlinger gjennom semesteret.

Det er plass til totalt 25 studenter på emnet. Ved færre enn 10 påmeldte studenter vil emnet ikke gjennomføres.`,

      examType: "Semesteroppgave",

      studentCount: 1223,
      averageGrade: 4,
      passRate: 96,

      campuses: ["GJOVIK"],
      taughtSemesters: ["FALL"],
      teachingLanguages: ["NORWEGIAN"],
    },
  ] as const satisfies Prisma.CourseCreateManyInput[]
