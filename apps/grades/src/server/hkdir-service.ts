import { z, type ZodSchema } from "zod"

export type HkdirDepartment = z.infer<typeof HkdirDepartment>
export const HkdirDepartment = z.object({
  "Nivå": z.string(),
  "Nivå_tekst": z.string(),
  "Institusjonskode": z.string(),
  "Institusjonsnavn": z.string(),
  "Avdelingskode": z.string(),
  "Avdelingsnavn": z.string(),
  "Gyldig_fra": z.string().nullish().default(null),
  "Gyldig_til": z.string().nullish().default(null),
  "fagkode_avdeling": z.string().nullish().default(null),
  "fagnavn_avdeling": z.string().nullish().default(null),
  "Fakultetskode": z.string(),
  "Fakultetsnavn": z.string(),
  "Avdelingskode (3 siste siffer)": z.string(),
})

export type HkdirSubject = z.infer<typeof HkdirSubject>
export const HkdirSubject = z.object({
  "Institusjonskode": z.string(),
  "Institusjonsnavn": z.string(),
  "Avdelingskode": z.string(),
  "Avdelingsnavn": z.string(),
  "Avdelingskode_SSB": z.string(),
  "Årstall": z.string(),
  "Semester": z.string(),
  "Semesternavn": z.string(),
  "Studieprogramkode": z.string(),
  "Studieprogramnavn": z.string(),
  "Emnekode": z.string(),
  "Emnenavn": z.string(),
  "Nivåkode": z.string(),
  "Nivånavn": z.string(),
  "Studiepoeng": z.string(),
  "NUS-kode": z.string(),
  "Status": z.string(),
  "Statusnavn": z.string(),
  "Underv.språk": z.string(),
  "Navn": z.string(),
  "Fagkode": z.string().nullish().default(null),
  "Fagnavn": z.string().nullish().default(null),
  "Oppgave (ny fra h2012)": z.string().nullish().default(null),
})

export type HkdirGrade = z.infer<typeof HkdirGrade>
export const HkdirGrade = z.object({
  "Årstall": z.string(),
  "Semester": z.string(),
  "Semesternavn": z.string(),
  "Karakter": z.string(),
  "Emnekode": z.string(),
  "Antall kandidater totalt": z.string(),
})

const HKDIR_API_BASE_URL = "https://dbh.hkdir.no/api/Tabeller/hentJSONTabellData"

type QueryOption = Record<string, unknown>
interface QueryOptions {
  sortBy?: string[]
  groupBy?: string[]
  filter: QueryOption[]
}

export interface HkdirService {
  getDepartments(institution: string): Promise<HkdirDepartment[]>
  getSubjects(institution: string): Promise<HkdirSubject[]>
  getSubjectGrades(institution: string): Promise<HkdirGrade[]>
}

export class HkdirServiceImpl implements HkdirService {
  public constructor(private readonly fetch: WindowOrWorkerGlobalScope["fetch"]) {}

  public async getDepartments(institution: string): Promise<HkdirDepartment[]> {
    const query = this.createQuery(210, {
      sortBy: ["Nivå"],
      filter: [
        this.createQueryFilter("Institusjonskode", [institution.toString()]),
        this.createExcludeQueryFilter("Avdelingskode", ["000000"]),
      ],
    })
    return await this.query(HkdirDepartment.array(), query)
  }

  async getSubjects(institution: string): Promise<HkdirSubject[]> {
    const query = this.createQuery(208, {
      sortBy: ["Årstall", "Institusjonskode", "Avdelingskode"],
      filter: [
        this.createQueryFilter("Institusjonskode", [institution.toString()]),
        this.createQueryFilter("Nivåkode", ["HN", "LN"]),
        this.createQueryFilter("Status", ["1", "2"]),
        this.createTopQueryFilter("Årstall", 3),
        this.createExcludeQueryFilter("Avdelingskode", ["000000"]),
      ],
    })
    return await this.query(HkdirSubject.array(), query)
  }

  async getSubjectGrades(institution: string): Promise<HkdirGrade[]> {
    const query = this.createQuery(308, {
      groupBy: ["Årstall", "Semester", "Karakter", "Emnekode", "Institusjonskode"],
      filter: [
        this.createQueryFilter("Institusjonskode", [institution.toString()]),
        this.createTopQueryFilter("Årstall", 3),
        this.createAllQueryFilter("Emnekode"),
        this.createAllQueryFilter("Semester"),
      ],
    })
    return await this.query(HkdirGrade.array(), query)
  }

  private createQuery(tableId: number, options: QueryOptions): Record<string, unknown> {
    return {
      tabell_id: tableId,
      api_versjon: 1,
      statuslinje: "N",
      kodetekst: "J",
      desimal_separator: ".",
      variabler: ["*"],
      sortBy: options.sortBy,
      groupBy: options.groupBy,
      filter: options.filter,
    }
  }

  private async query<T extends ZodSchema>(schema: T, parameters: Record<string, unknown>): Promise<z.infer<T>> {
    const response = await this.fetch(HKDIR_API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(parameters),
    })
    if (response.body === null) {
      throw new Error("HKDir API Response did not contain a body.")
    }

    return schema.parse(await response.json())
  }

  private createQueryFilter(variableName: string, values: string[]) {
    return {
      variabel: variableName,
      selection: {
        filter: "item",
        values,
      },
    }
  }

  private createTopQueryFilter(variableName: string, query: number) {
    return {
      variabel: variableName,
      selection: {
        filter: "top",
        values: [query.toString()],
        exclude: [""],
      },
    }
  }

  private createExcludeQueryFilter(variableName: string, values: string[]) {
    return {
      variabel: variableName,
      selection: {
        filter: "all",
        values: ["*"],
        exclude: values,
      },
    }
  }

  private createAllQueryFilter(variableName: string) {
    return {
      variabel: variableName,
      selection: {
        filter: "all",
        values: ["*"],
        exclude: [""],
      },
    }
  }
}
