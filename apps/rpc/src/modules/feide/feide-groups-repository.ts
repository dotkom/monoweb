import { getLogger } from "@dotkomonline/logger"
import {
  type FeideResponseGroup,
  FeideResponseGroupSchema,
  type NTNUGroup,
  type StudentInformation,
} from "@dotkomonline/types"
import { z } from "zod"

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
   * NOTE: The access token (which is opaque) can be expired in which case we get a 401 unauthorized response. In this
   * scenario, the caller should handle the error and re-authenticate the user to get a new access token.
   *
   * @see https://docs.feide.no/reference/apis/groups_api/index.html
   */
  getStudentInformation(accessToken: string): Promise<StudentInformation | null>
}

export function getFeideGroupsRepository(): FeideGroupsRepository {
  const logger = getLogger("feide-groups-repository")
  return {
    async getStudentInformation(accessToken) {
      const response = await fetch("https://groups-api.dataporten.no/groups/me/groups", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (!response.ok) {
        const output = await response.text()
        logger.error(
          "Failed to fetch student groups from Feide Groups API: %o for HTTP response %d",
          output,
          response.status
        )
        // In case of a 401, we can continue as the access token is likely expired.
        if (response.status === 401) {
          logger.warn("Access token is likely expired, returning null")
          return null
        }
        throw new Error(
          `Failed to fetch student groups from Feide Groups API: ${output} for HTTP response ${response.status}`
        )
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
