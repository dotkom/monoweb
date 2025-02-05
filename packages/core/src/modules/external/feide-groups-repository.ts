import { z } from "zod"

type GroupType = "subject" | "studyProgramme" | "studySpecialisation"

export type FeideGroup = {
  name: string
  code: string
  finished?: Date
}

export type StudentInformation = {
  subjects: FeideGroup[]
  studyProgrammes: FeideGroup[]
  studySpecialisations: FeideGroup[]
}

export interface FeideGroupsRepository {
  getStudentInformation(accessToken: string): Promise<StudentInformation>
}

const FeideResponseGroupSchema = z.object({
  id: z.string(),
  type: z.string(),
  displayName: z.string(),
  parent: z.string().optional(),
  membership: z
    .object({
      basic: z.string(),
      displayName: z.string().optional(),
      notAfter: z.string().optional(),
      notBefore: z.string().optional(),
    })
    .optional(),
})

export class FeideGroupsRepositoryImpl implements FeideGroupsRepository {
  private readonly baseUrl = "https://groups-api.dataporten.no/groups"

  private responseGroupToFeideGroup(group: z.infer<typeof FeideResponseGroupSchema>): FeideGroup {
    return {
      name: group.displayName,
      code: group.id.split(":")[5],
      finished: group.membership?.notAfter ? new Date(group.membership.notAfter) : undefined,
    }
  }

  async getStudentInformation(accessToken: string): Promise<StudentInformation> {
    console.log("FETCHING WITH THIS TOKEN:", accessToken)
    const response = await fetch(`${this.baseUrl}/me/groups`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch student information: ${await response.text()}`)
    }

    const responseGroups = z.array(FeideResponseGroupSchema).parse(await response.json())

    const subjects = responseGroups.filter((group) => group.type === "fc:fs:emne").map(this.responseGroupToFeideGroup)

    const studySpecialization = responseGroups
      .filter((group) => group.type === "fc:fs:str")
      .map(this.responseGroupToFeideGroup)

    const studyProgramme = responseGroups
      .filter((group) => group.type === "fc:fs:prg")
      .map(this.responseGroupToFeideGroup)

    return {
      subjects: subjects,
      studyProgrammes: studyProgramme,
      studySpecialisations: studySpecialization,
    }
  }
}
