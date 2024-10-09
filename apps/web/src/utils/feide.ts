import { FeideDocumentation, Membership, MembershipDocumentation } from "@dotkomonline/types"
import { z } from "zod"

const FeideGroupSchema = z.object({
  id: z.string(),
  type: z.string(),
  displayName: z.string(),
  membership: z.object({
    notAfter: z.string().datetime().optional(),
  }).optional(),
})

const FeideProfileSchema = z.object({
  norEduPersonLegalName: z.string(),
  uid: z.array(z.string()),
  sn: z.array(z.string()).length(1),
  givenName: z.array(z.string()).length(1),
})

export type FeideGroup = z.infer<typeof FeideGroupSchema>
export type FeideProfile = z.infer<typeof FeideProfileSchema>

export function createDocumentation(groups: FeideGroup[], profile: FeideProfile): MembershipDocumentation {
  const subjects = groups
    .filter((group) => group.type === "fc:fs:emne")
    .map((group) => ({ code: group.id.split(":").slice(5)[0], name: group.displayName, year: group.membership?.notAfter ? new Date(group.membership.notAfter).getFullYear() : undefined }))

  const studyPrograms = groups
    .filter((group) => group.type === "fc:fs:prg")
    .map((group) => ({ code: group.id.split(":").slice(5)[0], name: group.displayName }))

  const studyFields = groups
    .filter((group) => group.type === "fc:fs:fs:str")
    .map((group) => group.id.split(":").slice(5).join(":"))

  const fullName = profile.norEduPersonLegalName;
  const givenName = profile.givenName[0];
  const familyName = profile.sn[0];
  const feideUsername = profile.uid[0];

  return { subjects, studyPrograms, studyFields, fullName, givenName, familyName, feideUsername }
}

export function calculateDefaultMembership(documentation: MembershipDocumentation): Membership | null {
  return null
}

export async function getFeideGroups(access_token: string): Promise<FeideGroup[]> {
  const groups_response = await fetch("https://groups-api.dataporten.no/groups/me/groups?show_all=true", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })

  if (!groups_response.ok) {
    throw new Error(`Failed to get groups: ${await groups_response.text()}`)
  }

  const data = await groups_response.json();

  return z.array(FeideGroupSchema).parse(data)
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
