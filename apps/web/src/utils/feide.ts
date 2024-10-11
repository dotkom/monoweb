import { FeideDocumentation, FieldOfStudy, Membership, MembershipDocumentation } from "@dotkomonline/types"
import { z } from "zod"

export function createDocumentation(groups: FeideGroup[], profile: FeideProfile): MembershipDocumentation {
  const subjects = groups
    .filter((group) => group.type === "fc:fs:emne")
    .map((group) => ({ code: group.id.split(":").slice(5)[0], name: group.displayName, year: group.membership?.notAfter ? new Date(group.membership.notAfter).getFullYear() : undefined }))

  const studyProgrammes = groups
    .filter((group) => group.type === "fc:fs:prg")
    .map((group) => ({ code: group.id.split(":").slice(5)[0], name: group.displayName }))

  const studyFields = groups
    .filter((group) => group.type === "fc:fs:fs:str")
    .map((group) => group.id.split(":").slice(5).join(":"))

  const fullName = profile.norEduPersonLegalName;
  const givenName = profile.givenName[0];
  const familyName = profile.sn[0];
  const feideUsername = profile.uid[0];

  return { subjects, studyProgrammes, studyFields, fullName, givenName, familyName, feideUsername }
}

const MASTER_STUDY_CODES = ["MSIT", "MIT"] satisfies string[]
const BACHELOR_STUDY_CODES = ["BIT"] satisfies string[]

const isMasterStudy = (studyProgramme: string) => MASTER_STUDY_CODES.includes(studyProgramme)
const isBachelorStudy = (studyProgramme: string) => BACHELOR_STUDY_CODES.includes(studyProgramme)

function getStudyType(studyProgrammes: { code: string }[]): "MASTER" | "BACHELOR" | null {
  if (studyProgrammes.some(({ code }) => isMasterStudy(code))) {
    return "MASTER"
  }

  if (studyProgrammes.some(({ code }) => isBachelorStudy(code))) {
    return "BACHELOR"
  }

  return null
}

// Warning: Assumes that the user is a master student, will place all other students in "MASTER_OTHER"
function getMasterStudyProgramme(studyFieldCodes: string[]): FieldOfStudy {
  for (const code of studyFieldCodes) {
    switch (code) {
      // Current MSIT study programmes as of 2024
      case "MSIT-AI": return "MASTER_ARTIFICIAL_INTELLIGENCE"
      case "MSIT-DBS": return "MASTER_DATABASE_AND_SEARCH"
      case "MSIT-IXDGLT": return "MASTER_INTERACTION_DESIGN"
      case "MSIT-SWE": return "MASTER_SOFTWARE_ENGINEERING"

      // Old MIT study programmes
      case "MIT-KI": return "MASTER_ARTIFICIAL_INTELLIGENCE"
      case "MIT-DBS": return "MASTER_DATABASE_AND_SEARCH"
      case "MIT-ISL": return "MASTER_INTERACTION_DESIGN"
      case "MIT-PVS": return "MASTER_SOFTWARE_ENGINEERING"

      default: continue
    }
  }

  return "MASTER_OTHER"
}

export function calculateDefaultMembership({ studyProgrammes, studyFields, subjects }: MembershipDocumentation): Membership | null {
  const studyType = getStudyType(studyProgrammes)

  if (studyType === "BACHELOR") {
    const fieldOfStudy = "BACHELOR"

    const classYear = subjects
      .filter(({ year }) => year !== undefined)
      .map(({ year }) => year! - new Date().getFullYear() + 1)
      .sort((a, b) => b - a)[0] ?? 1

    return {
      fieldOfStudy,
      classYear
    }
  }

  if (studyType === "MASTER") {
    const fieldOfStudy = getMasterStudyProgramme(studyFields)

    const defaultClassYear = subjects
      .filter(({ year }) => year !== undefined)
      .map(({ year }) => year! - new Date().getFullYear() + 1)
      .sort((a, b) => b - a)[0] ?? 1
    const classYear = Math.max(4, defaultClassYear)

    return {
      fieldOfStudy,
      classYear
    }
  }

  return null
}

export async function getFeideProfileInformation(access_token: string): Promise<FeideProfile> {
  const profile_response = await fetch("https://api.dataporten.no/userinfo/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  if (!profile_response.ok) {
    throw new Error(`Failed to get profile: ${await profile_response.text()}`)
  }

  return FeideProfileSchema.parse(await profile_response.json())
}
