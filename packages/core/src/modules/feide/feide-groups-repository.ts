import {
  type FeideResponseGroup,
  FeideResponseGroupSchema,
  type NTNUGroup,
  type StudentInformation,
} from "@dotkomonline/types"
import { z } from "zod"
import { StudentGroupsNotFoundError } from "./feide-groups-error"

const SUBJECT_GROUP_TYPE = "fc:fs:emne"
const STUDY_PROGRAMME_GROUP_TYPE = "fc:fs:prg"
const STUDY_SPECIALIZATION_GROUP_TYPE = "fc:fs:str"

export interface FeideGroupsRepository {
  /**
   * Fetches student information from the Feide Groups API using the provided access token.
   *
   * @param accessToken - The OAuth2 access token for authentication.
   * @returns A promise that resolves to an object containing the student's courses, study programmes, and specializations.
   * @throws An error if the request fails or if the response is not in the expected format.
   *
   * @see https://docs.feide.no/reference/apis/groups_api/index.html
   */
  getStudentInformation(accessToken: string): Promise<StudentInformation>
}

export function getFeideGroupsRepository(): FeideGroupsRepository {
  return {
    async getStudentInformation(accessToken) {
      const response = await fetch("https://groups-api.dataporten.no/groups/me/groups", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (!response.ok) {
        throw new StudentGroupsNotFoundError(await response.text())
      }

      const responseGroups = z.array(FeideResponseGroupSchema).parse(await response.json())

      const courses = responseGroups
        .filter((group) => group.type === SUBJECT_GROUP_TYPE) //
        .map(feideGroupToNTNUGroup)

      const studyProgrammes = responseGroups
        .filter((group) => group.type === STUDY_PROGRAMME_GROUP_TYPE)
        .map(feideGroupToNTNUGroup)

      const studySpecializations = responseGroups
        .filter((group) => group.type === STUDY_SPECIALIZATION_GROUP_TYPE)
        .map(feideGroupToNTNUGroup)

      return {
        courses,
        studyProgrammes,
        studySpecializations,
      }
    },
  }
}

const feideGroupToNTNUGroup = (group: FeideResponseGroup): NTNUGroup => ({
  // fc:fs:fs:<type>:<domain>:<id>:<version>
  //                          ^^^^
  code: group.id.split(":")[5],
  name: group.displayName,
  finished: group.membership?.notAfter ? new Date(group.membership.notAfter) : undefined,
})
