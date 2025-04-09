import { z } from "zod"

export type NTNUGroup = {
  name: string
  code: string
  finished?: Date
}

export type StudentInformation = {
  courses: NTNUGroup[]
  studyProgrammes: NTNUGroup[]
  studySpecializations: NTNUGroup[]
}

export interface NTNUGroupsRepository {
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

/* This repository gathers information about a student from the feide groups api */
export class NTNUGroupsRepositoryImpl implements NTNUGroupsRepository {
  // https://docs.feide.no/reference/apis/groups_api/index.html
  private readonly baseUrl = "https://groups-api.dataporten.no/groups"

  private feideGroupToNTNUGroup(group: z.infer<typeof FeideResponseGroupSchema>): NTNUGroup {
    return {
      name: group.displayName,
      code: group.id.split(":")[5],
      finished: group.membership?.notAfter ? new Date(group.membership.notAfter) : undefined,
    }
  }

  async getStudentInformation(accessToken: string): Promise<StudentInformation> {
    const response = await fetch(`${this.baseUrl}/me/groups`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch student information: ${await response.text()}`)
    }

    const responseGroups = z.array(FeideResponseGroupSchema).parse(await response.json())

    const courses = responseGroups.filter((group) => group.type === "fc:fs:emne").map(this.feideGroupToNTNUGroup)

    const studySpecializations = responseGroups
      .filter((group) => group.type === "fc:fs:str")
      .map(this.feideGroupToNTNUGroup)

    const studyProgrammes = responseGroups.filter((group) => group.type === "fc:fs:prg").map(this.feideGroupToNTNUGroup)

    return {
      courses,
      studyProgrammes,
      studySpecializations,
    }
  }
}
