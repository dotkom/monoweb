import { getMembershipService, MASTER_SEMESTER_OFFSET } from "./membership-service"
import { describe, expect, it, beforeEach, afterEach, vitest as vi } from "vitest"

describe("Membership integration tests", () => {
  const membershipService = getMembershipService()

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("bachelor example 1", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_1

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 2", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_2

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 3", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_3

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 4", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_4

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 5", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_5

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 6", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_6

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 7", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_7

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 8", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_8

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 9", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_9

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 10", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_10

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 11", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_11

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 12", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_12

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("bachelor example 13", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_13

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("master example 1", async () => {
    const { goal, courses, dataRetrievedAt } = BACHELOR.EXAMPLE_1

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("BACHELOR", courses)
    expect(semester).toBe(goal)
  })

  it("master example 2", async () => {
    const { goal, courses, dataRetrievedAt } = MASTER.EXAMPLE_1

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("MASTER", courses)
    expect(semester).toBe(goal)
  })

  it("master example 3", async () => {
    const { goal, courses, dataRetrievedAt } = MASTER.EXAMPLE_2

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("MASTER", courses)
    expect(semester).toBe(goal)
  })

  it("master example 4", async () => {
    const { goal, courses, dataRetrievedAt } = MASTER.EXAMPLE_3

    vi.setSystemTime(new Date(dataRetrievedAt))

    const semester = membershipService.findEstimatedSemester("MASTER", courses)
    expect(semester).toBe(goal)
  })
})

const MASTER = {
  EXAMPLE_1: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: MASTER_SEMESTER_OFFSET + 3,
    courses: [
      {
        code: "IT1901",
        name: "Informatikk prosjektarbeid I",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4136",
        name: "Introduksjon til kunstig intelligens ",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "IT3105",
        name: "Kunstig intelligens programmering",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4300",
        name: "Datavarehus og datagruvedrift",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4160",
        name: "Datamaskiner",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2901",
        name: "Informatikk prosjektarbeid II",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4186",
        name: "Operativsystemer",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "ØKO1001",
        name: "Ledelse",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "IIK3100",
        name: "Etisk hacking og penetrasjonstesting",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "IT3915",
        name: "Master i informatikk, forberedende prosjekt",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2805",
        name: "Webteknologi",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4240",
        name: "Programvarearkitektur",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2810",
        name: "Webutvikling",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TIØ4852",
        name: "Eksperter i team - En skog av muligheter - Smarte skoger og samfunn",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4145",
        name: "Datamodellering og databasesystemer",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "IT3212",
        name: "Datadrevet Programvare",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4120",
        name: "Algoritmer og datastrukturer",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4140",
        name: "Programvareutvikling",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4171",
        name: "Metoder i kunstig intelligens",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4173",
        name: "Moderne maskinlæring i praksis",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4172",
        name: "Introduksjon til maskinlæring",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4259",
        name: "Anvendt data science",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IT3021",
        name: "Spill+",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4237",
        name: "Programvaresikkerhet og personvern",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "IT3920",
        name: "Masteroppgave for MSIT",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "MFEL1050",
        name: "Innføring i idrettsfysiologi: trening for prestasjon, helse og livskvalitet",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
    ],
  },
  EXAMPLE_2: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: MASTER_SEMESTER_OFFSET + 1,
    courses: [
      {
        code: "HMS0009",
        name: "HMS-kurs for 1. årsstudenter 2-årig master",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4117",
        name: "Informasjonsgjenfinning",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "IT1901",
        name: "Informatikk prosjektarbeid I",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4136",
        name: "Introduksjon til kunstig intelligens ",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4300",
        name: "Datavarehus og datagruvedrift",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4160",
        name: "Datamaskiner",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2901",
        name: "Informatikk prosjektarbeid II",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "ØKO1001",
        name: "Ledelse",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4225",
        name: "Store, distribuerte datamengder",
        finished: undefined,
      },
      {
        code: "TDT4858",
        name: "Eksperter i team - Digital formidling av fortiden",
        finished: undefined,
      },
      {
        code: "IT2805",
        name: "Webteknologi",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2810",
        name: "Webutvikling",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4145",
        name: "Datamodellering og databasesystemer",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "IT3212",
        name: "Datadrevet Programvare",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4120",
        name: "Algoritmer og datastrukturer",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4140",
        name: "Programvareutvikling",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4171",
        name: "Metoder i kunstig intelligens",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "TMA4115",
        name: "Matematikk 3",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4173",
        name: "Moderne maskinlæring i praksis",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4172",
        name: "Introduksjon til maskinlæring",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4259",
        name: "Anvendt data science",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TMA4245",
        name: "Statistikk",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
    ],
  },
  EXAMPLE_3: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: MASTER_SEMESTER_OFFSET + 3,
    courses: [
      {
        code: "HMS0009",
        name: "HMS-kurs for 1. årsstudenter 2-årig master",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IDG1362",
        name: "Menneskesentrert design",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "DCSG1006",
        name: "Datakommunikasjon og nettverk",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "DCSG1005",
        name: "Infrastruktur: sikre grunntjenester",
        finished: undefined,
      },
      {
        code: "IDATG2202",
        name: "Operativsystemer, virtualisering og sikkerhet",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "PROG1001",
        name: "Grunnleggende programmering",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "IT3010",
        name: "Forskningsbasert digitalisering",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "PROG1004",
        name: "Programvareutvikling",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "IØ2000",
        name: "Hvordan bli en endringsagent? Innovasjon og entreprenørskap i praksis",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TTM4195",
        name: "Blokkjede-teknologier og kryptografiske verktøy",
        finished: undefined,
      },
      {
        code: "PROG1003",
        name: "Objektorientert programmering",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "IDATG2204",
        name: "Datamodellering og databasesystemer",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4225",
        name: "Store, distribuerte datamengder",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "DCSG1002",
        name: "Cybersikkerhet og teamarbeid",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "IIK3100",
        name: "Etisk hacking og penetrasjonstesting",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "DCSG1001",
        name: "Infrastruktur: grunnleggende ferdigheter",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "IT3915",
        name: "Master i informatikk, forberedende prosjekt",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "BMA1010",
        name: "Matematikk for Informatikk",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4240",
        name: "Programvarearkitektur",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "TBA4851",
        name: "Eksperter i team - Idrettsteknologi - ParaGO",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "IT2810",
        name: "Webutvikling",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "DCSG2003",
        name: "Robuste og skalerbare tjenester ",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "DCSG2001",
        name: "Sammenkoblede nettverk og nettverkssikkerhet",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "INFT2504",
        name: "Skytjenester som arbeidsflate",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "IT3212",
        name: "Datadrevet Programvare",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "PROG2053",
        name: "Webteknologier",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4175",
        name: "Informasjonssystemer",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TPD4114",
        name: "Visuell formidling",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4237",
        name: "Programvaresikkerhet og personvern",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "IIKG3005",
        name: "Infrastructure as Code",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "IDATG2102",
        name: "Algoritmiske metoder",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "IT3920",
        name: "Masteroppgave for MSIT",
        finished: undefined,
      },
      {
        code: "DCSG2005",
        name: "Risikostyring",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "DCSG2900",
        name: "Bacheloroppgave Bachelor i digital infrastruktur og cybersikkerhet",
        finished: undefined,
      },
      {
        code: "IMT4116",
        name: "Skadevareanalyse og reversing",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4250",
        name: "Modell-drevet programvareutvikling",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
    ],
  },
  EXAMPLE_4: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: MASTER_SEMESTER_OFFSET + 3,
    courses: [
      {
        code: "TDT4117",
        name: "Informasjonsgjenfinning",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "IT1901",
        name: "Informatikk prosjektarbeid I",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      { code: "TDT4305", name: "Big Data-arkitektur", finished: undefined },
      {
        code: "TDT4136",
        name: "Introduksjon til kunstig intelligens ",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "JAP0501",
        name: "Japansk 1",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "JAP0502",
        name: "Japansk 2",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4160",
        name: "Datamaskiner",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2901",
        name: "Informatikk prosjektarbeid II",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4186",
        name: "Operativsystemer",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "ØKO1001",
        name: "Ledelse",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4225",
        name: "Store, distribuerte datamengder",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "IIK3100",
        name: "Etisk hacking og penetrasjonstesting",
        finished: undefined,
      },
      {
        code: "IT3915",
        name: "Master i informatikk, forberedende prosjekt",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2805",
        name: "Webteknologi",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: undefined,
      },
      {
        code: "IT2810",
        name: "Webutvikling",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4145",
        name: "Datamodellering og databasesystemer",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4120",
        name: "Algoritmer og datastrukturer",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4140",
        name: "Programvareutvikling",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4171",
        name: "Metoder i kunstig intelligens",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4150",
        name: "Avanserte databasesystemer",
        finished: undefined,
      },
      {
        code: "TDT4173",
        name: "Moderne maskinlæring i praksis",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      { code: "TDT4215", name: "Anbefalingssystemer", finished: undefined },
      {
        code: "TDT4172",
        name: "Introduksjon til maskinlæring",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TPD4116",
        name: "Visuell formidling",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "IT3920",
        name: "Masteroppgave for MSIT",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
    ],
  },
} as const

const BACHELOR = {
  EXAMPLE_1: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: 5,
    courses: [
      {
        code: "IT1901",
        name: "Informatikk prosjektarbeid I",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4136",
        name: "Introduksjon til kunstig intelligens ",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4160",
        name: "Datamaskiner",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IT1604",
        name: "Digitalt samfunn",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2901",
        name: "Informatikk prosjektarbeid II",
        finished: undefined,
      },
      {
        code: "TDT4186",
        name: "Operativsystemer",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "ØKO1001",
        name: "Ledelse",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IIK3100",
        name: "Etisk hacking og penetrasjonstesting",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2805",
        name: "Webteknologi",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TFOR0116",
        name: "Matematikk",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "TFOR0117",
        name: "Fysikk",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TTM4135",
        name: "Anvendt kryptografi og nettverksikkerhet",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "HIST2011",
        name: "Internasjonal historie etter 1870 ",
        finished: new Date("2021-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: undefined,
      },
      {
        code: "TDT4145",
        name: "Datamodellering og databasesystemer",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "HIST1505",
        name: "Innføring i historisk teori og metode",
        finished: new Date("2020-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4120",
        name: "Algoritmer og datastrukturer",
        finished: undefined,
      },
      {
        code: "TDT4140",
        name: "Programvareutvikling",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4171",
        name: "Metoder i kunstig intelligens",
        finished: undefined,
      },
      {
        code: "HIST1500",
        name: "Nyere historie etter ca. 1750",
        finished: new Date("2021-08-14T22:00:00.000Z"),
      },
      {
        code: "HIST1300",
        name: "Eldre historie fram til ca. 1750",
        finished: new Date("2020-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4172",
        name: "Introduksjon til maskinlæring",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TTM4185",
        name: "Sikkerhet og robusthet i IKT system",
        finished: undefined,
      },
      {
        code: "TDT4237",
        name: "Programvaresikkerhet og personvern",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
    ],
  },
  EXAMPLE_2: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: 5,
    courses: [
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "IT1901",
        name: "Informatikk prosjektarbeid I",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4145",
        name: "Datamodellering og databasesystemer",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4120",
        name: "Algoritmer og datastrukturer",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4140",
        name: "Programvareutvikling",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4160",
        name: "Datamaskiner",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2901",
        name: "Informatikk prosjektarbeid II",
        finished: undefined,
      },
      {
        code: "TDT4186",
        name: "Operativsystemer",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "IØ2000",
        name: "Hvordan bli en endringsagent? Innovasjon og entreprenørskap i praksis",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4237",
        name: "Programvaresikkerhet og personvern",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "MFEL1050",
        name: "Innføring i idrettsfysiologi: trening for prestasjon, helse og livskvalitet",
        finished: undefined,
      },
      {
        code: "IT2805",
        name: "Webteknologi",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4240",
        name: "Programvarearkitektur",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "MFEL1010",
        name: "Innføring i medisin for ikke-medisinere",
        finished: undefined,
      },
    ],
  },
  EXAMPLE_3: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: 5,
    courses: [
      {
        code: "IT1901",
        name: "Informatikk prosjektarbeid I",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "ISA1006",
        name: "Global Ethics and Human Rights",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4111",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4160",
        name: "Datamaskiner",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "KULT2201",
        name: "STS: Digitalisering og samfunnsendring",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "IT2901",
        name: "Informatikk prosjektarbeid II",
        finished: undefined,
      },
      {
        code: "BSA2500",
        name: "Veiledet praksis i sosialt arbeid",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "ISA1001",
        name: "Sosial- og velferdspolitikk",
        finished: new Date("2020-12-14T23:00:00.000Z"),
      },
      {
        code: "IT3010",
        name: "Forskningsbasert digitalisering",
        finished: undefined,
      },
      {
        code: "BSA2001",
        name: "Psykisk helse",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      { code: "TDT4186", name: "Operativsystemer", finished: undefined },
      {
        code: "KULT1101",
        name: "Digitale kulturer ",
        finished: new Date("2022-12-14T23:00:00.000Z"),
      },
      {
        code: "ØKO1001",
        name: "Ledelse",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "BSA2003",
        name: "Sosialt arbeid med individer og grupper",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "ISA1005",
        name: "Mentorskap i en flerkulturell kontekst - Nattergalen",
        finished: undefined,
      },
      {
        code: "BSA2002",
        name: "Rettsanvendelse i sosialt arbeid",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "BSA2005",
        name: "Nettverks- og samfunnsarbeid",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "ISA1003",
        name: "Psykologi i et livsløpsperspektiv",
        finished: new Date("2021-08-14T22:00:00.000Z"),
      },
      {
        code: "BSA2004",
        name: "Barnevern",
        finished: new Date("2021-12-14T23:00:00.000Z"),
      },
      {
        code: "ISA1002",
        name: "Juridisk metode og forvaltningsrett",
        finished: new Date("2020-12-14T23:00:00.000Z"),
      },
      {
        code: "BSA2007",
        name: "Profesjonsutøvelse i lokal og global kontekst",
        finished: new Date("2022-08-14T22:00:00.000Z"),
      },
      {
        code: "BSA2900",
        name: "Bacheloroppgave i sosialt arbeid",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "IIK3100",
        name: "Etisk hacking og penetrasjonstesting",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      { code: "IT2805", name: "Webteknologi", finished: undefined },
      {
        code: "EXPH0200",
        name: "Examen philosophicum for samfunnsvitenskap",
        finished: new Date("2021-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4145",
        name: "Datamodellering og databasesystemer",
        finished: undefined,
      },
      {
        code: "TDT4120",
        name: "Algoritmer og datastrukturer",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4140",
        name: "Programvareutvikling",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4237",
        name: "Programvaresikkerhet og personvern",
        finished: undefined,
      },
      {
        code: "BSA1001",
        name: "Sosialt arbeid som fag og profesjon ",
        finished: new Date("2020-12-14T23:00:00.000Z"),
      },
      {
        code: "ISA2500",
        name: "Tverrprofesjonelt samarbeid og innovasjon ",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "BSA1003",
        name: "Inkludering og levekår",
        finished: new Date("2021-08-14T22:00:00.000Z"),
      },
      {
        code: "BSA1004",
        name: "Sosialt arbeids teori og praksis",
        finished: new Date("2021-08-14T22:00:00.000Z"),
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: undefined,
      },
      {
        code: "MFEL1050",
        name: "Innføring i idrettsfysiologi: trening for prestasjon, helse og livskvalitet",
        finished: undefined,
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
    ],
  },
  EXAMPLE_4: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: 1,
    courses: [
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: undefined,
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: undefined,
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: undefined,
      },
      {
        code: "IT2805",
        name: "Webteknologi",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: undefined,
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: undefined,
      },
    ],
  },
  EXAMPLE_5: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: 1,
    courses: [
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: undefined,
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: undefined,
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: undefined,
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      { code: "IT2805", name: "Webteknologi", finished: undefined },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: undefined,
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
    ],
  },
  EXAMPLE_6: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: 1,
    courses: [
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: undefined,
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: undefined,
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      { code: "IT2805", name: "Webteknologi", finished: undefined },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: undefined,
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
    ],
  },
  EXAMPLE_7: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: 1,
    courses: [
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: undefined,
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: undefined,
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      { code: "IT2805", name: "Webteknologi", finished: undefined },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: undefined,
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
    ],
  },
  EXAMPLE_8: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: 3,
    courses: [
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IT1901",
        name: "Informatikk prosjektarbeid I",
        finished: undefined,
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4145",
        name: "Datamodellering og databasesystemer",
        finished: undefined,
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4120",
        name: "Algoritmer og datastrukturer",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4140",
        name: "Programvareutvikling",
        finished: undefined,
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4160",
        name: "Datamaskiner",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      { code: "TDT4186", name: "Operativsystemer", finished: undefined },
      {
        code: "ØKO1001",
        name: "Ledelse",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2805",
        name: "Webteknologi",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "MFEL1010",
        name: "Innføring i medisin for ikke-medisinere",
        finished: undefined,
      },
    ],
  },
  EXAMPLE_9: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: 3,
    courses: [
      {
        code: "IT1901",
        name: "Informatikk prosjektarbeid I",
        finished: undefined,
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: undefined,
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4160",
        name: "Datamaskiner",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "MA0002",
        name: "Brukerkurs i matematikk B",
        finished: undefined,
      },
      { code: "TDT4186", name: "Operativsystemer", finished: undefined },
      {
        code: "ØKO1001",
        name: "Ledelse",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      { code: "PSY2101", name: "Psykiske lidelser", finished: undefined },
      {
        code: "IT2805",
        name: "Webteknologi",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4240",
        name: "Programvarearkitektur",
        finished: undefined,
      },
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4125",
        name: "Algoritmekonstruksjon",
        finished: undefined,
      },
      {
        code: "TTM4135",
        name: "Anvendt kryptografi og nettverksikkerhet",
        finished: undefined,
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      { code: "SPA0502", name: "Spansk 2", finished: undefined },
      {
        code: "TDT4145",
        name: "Datamodellering og databasesystemer",
        finished: undefined,
      },
      {
        code: "TDT4120",
        name: "Algoritmer og datastrukturer",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4140",
        name: "Programvareutvikling",
        finished: undefined,
      },
      {
        code: "TPD4116",
        name: "Visuell formidling",
        finished: new Date("2026-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4237",
        name: "Programvaresikkerhet og personvern",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: undefined,
      },
      {
        code: "MFEL1050",
        name: "Innføring i idrettsfysiologi: trening for prestasjon, helse og livskvalitet",
        finished: undefined,
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "MFEL1010",
        name: "Innføring i medisin for ikke-medisinere",
        finished: undefined,
      },
    ],
  },
  EXAMPLE_10: {
    dataRetrievedAt: new Date(2026, 1, 31),
    goal: 1,
    courses: [
      {
        code: "TMA4400",
        name: "Matematikk 1: Kalkulus og lineær algebra",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: undefined,
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: undefined,
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
      { code: "IT2805", name: "Webteknologi", finished: undefined },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: undefined,
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2025-12-14T23:00:00.000Z"),
      },
    ],
  },
  EXAMPLE_11: {
    dataRetrievedAt: new Date(2025, 10, 15),
    goal: 4,
    courses: [
      {
        code: "IT1901",
        name: "Informatikk prosjektarbeid I",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4136",
        name: "Introduksjon til kunstig intelligens ",
        finished: undefined,
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: undefined,
      },
      {
        code: "TDT4160",
        name: "Datamaskiner",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IT1604",
        name: "Digitalt samfunn",
        finished: undefined,
      },
      {
        code: "TDT4186",
        name: "Operativsystemer",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "ØKO1001",
        name: "Ledelse",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IIK3100",
        name: "Etisk hacking og penetrasjonstesting",
        finished: undefined,
      },
      {
        code: "IT2805",
        name: "Webteknologi",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TFOR0116",
        name: "Matematikk",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "TFOR0117",
        name: "Fysikk",
        finished: new Date("2023-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "TTM4135",
        name: "Anvendt kryptografi og nettverksikkerhet",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "HIST2011",
        name: "Internasjonal historie etter 1870 ",
        finished: new Date("2021-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: undefined,
      },
      {
        code: "TDT4145",
        name: "Datamodellering og databasesystemer",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "HIST1505",
        name: "Innføring i historisk teori og metode",
        finished: new Date("2020-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4120",
        name: "Algoritmer og datastrukturer",
        finished: undefined,
      },
      {
        code: "TDT4140",
        name: "Programvareutvikling",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "HIST1500",
        name: "Nyere historie etter ca. 1750",
        finished: new Date("2021-08-14T22:00:00.000Z"),
      },
      {
        code: "HIST1300",
        name: "Eldre historie fram til ca. 1750",
        finished: new Date("2020-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4172",
        name: "Introduksjon til maskinlæring",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2023-12-14T23:00:00.000Z"),
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: new Date("2024-08-14T22:00:00.000Z"),
      },
    ],
  },
  EXAMPLE_12: {
    dataRetrievedAt: new Date(2025, 10, 15),
    goal: 0,
    courses: [
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: undefined,
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: undefined,
      },
      { code: "IT2805", name: "Webteknologi", finished: undefined },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: undefined,
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: undefined,
      },
    ],
  },
  EXAMPLE_13: {
    dataRetrievedAt: new Date(2025, 10, 15),
    goal: 2,
    courses: [
      {
        code: "TDT4109",
        name: "Informasjonsteknologi, grunnkurs",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IT1901",
        name: "Informatikk prosjektarbeid I",
        finished: undefined,
      },
      {
        code: "TDT4100",
        name: "Objektorientert programmering",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "TDT4180",
        name: "Menneske–maskin-interaksjon",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "MA0001",
        name: "Brukerkurs i matematikk A",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4120",
        name: "Algoritmer og datastrukturer",
        finished: undefined,
      },
      {
        code: "HMS0002",
        name: "HMS-kurs for 1. årsstudenter",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "TDT4160",
        name: "Datamaskiner",
        finished: undefined,
      },
      {
        code: "ØKO1001",
        name: "Ledelse",
        finished: undefined,
      },
      {
        code: "TTM4100",
        name: "Kommunikasjon - Tjenester og nett",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "EXPH0300",
        name: "Examen philosophicum for naturvitenskap og teknologi",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "IT2805",
        name: "Webteknologi",
        finished: new Date("2024-12-14T23:00:00.000Z"),
      },
      {
        code: "MA0301",
        name: "Elementær diskret matematikk",
        finished: new Date("2025-08-14T22:00:00.000Z"),
      },
      {
        code: "MFEL1010",
        name: "Innføring i medisin for ikke-medisinere",
        finished: undefined,
      },
    ],
  },
} as const
