import { getMembershipService } from "./membership-service"
import type { NTNUGroup } from "../feide/feide-groups-repository"
import { describe, expect, it } from "vitest"
import { subYears } from "date-fns"
import { getAcademicStart } from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"

const getYearFromDelta = (delta: number) => subYears(getAcademicStart(getCurrentUTC()), delta).getFullYear()

describe("Membership integration tests", () => {
  const membershipService = getMembershipService()

  it("bachelor example 1", async () => {
    const { goal, courses } = BACHELOR.EXAMPLE_1
    const delta = membershipService.findBachelorStartYearDelta(courses)
    expect(getYearFromDelta(delta)).toBe(goal)
  })

  it("bachelor example 2", async () => {
    const { goal, courses } = BACHELOR.EXAMPLE_2
    const delta = membershipService.findBachelorStartYearDelta(courses)
    expect(getYearFromDelta(delta)).toBe(goal)
  })

  it("bachelor example 3", async () => {
    const { goal, courses } = BACHELOR.EXAMPLE_3
    const delta = membershipService.findBachelorStartYearDelta(courses)
    expect(getYearFromDelta(delta)).toBe(goal)
  })

  it("master example 1", async () => {
    const { goal, courses } = MASTER.EXAMPLE_1
    const delta = membershipService.findMasterStartYearDelta(courses)
    expect(getYearFromDelta(delta)).toBe(goal)
  })

  it("master example 2", async () => {
    const { goal, courses } = MASTER.EXAMPLE_2
    const delta = membershipService.findMasterStartYearDelta(courses)
    expect(getYearFromDelta(delta)).toBe(goal)
  })
})

const MASTER = {
  EXAMPLE_1: {
    goal: 2024,
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
    goal: 2025,
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
} as const satisfies Record<string, { goal: number; courses: NTNUGroup[] }>

const BACHELOR = {
  EXAMPLE_1: {
    goal: 2023,
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
    goal: 2023,
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
    goal: 2023,
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
} as const satisfies Record<string, { goal: number; courses: NTNUGroup[] }>
