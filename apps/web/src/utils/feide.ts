import type { MembershipDocumentation } from "@dotkomonline/types"
import { z } from "zod"

export const FeideGroupSchema = z.object({
  id: z.string(),
  type: z.string(),
  displayName: z.string(),
})

const ProfileSchema = z.object({
  norEduPersonLegalName: z.string(),
  uid: z.array(z.string()),
  sn: z.array(z.string()).length(1),
  givenName: z.array(z.string()).length(1),
})

type FeideGroup = z.infer<typeof FeideGroupSchema>

function convertFeidegroupsToDocumentation(groups: FeideGroup[]): MembershipDocumentation {
  const subjects = groups
    .filter((group) => group.type === "fc:fs:emne")
    .map((group) => ({ code: group.id.split(":").slice(5)[0], name: group.displayName }))

  const studyPrograms = groups
    .filter((group) => group.type === "fc:fs:prg")
    .map((group) => ({ code: group.id.split(":").slice(5)[0], name: group.displayName }))

  const studyFields = groups
    .filter((group) => group.type === "fc:fs:fs:str")
    .map((group) => group.id.split(":").slice(5).join(":"))

  return { subjects, studyPrograms, studyFields }
}

export async function getFeideMembershipDocumentation(access_token: string): Promise<MembershipDocumentation> {
  const groups_response = await fetch("https://groups-api.dataporten.no/groups/me/groups?show_all=true", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  if (!groups_response.ok) {
    throw new Error(`Failed to get groups: ${await groups_response.text()}`)
  }

  const groups = z.array(FeideGroupSchema).parse(await groups_response.json())

  return convertFeidegroupsToDocumentation(groups)
}

export async function getFeideProfileInformation(access_token: string) {
  const profile_response = await fetch("https://api.dataporten.no/userinfo/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  if (!profile_response.ok) {
    throw new Error(`Failed to get profile: ${await profile_response.text()}`)
  }

  const profile = ProfileSchema.parse(await profile_response.json())

  return profile
}
