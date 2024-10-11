import { MembershipDocumentation } from "@dotkomonline/types"
import { z } from "zod"

const FeideGroupMembershipSchema = z.object({
  basic: z.string(),
  displayName: z.string(),
  affiliation: z.array(z.string()),
  primaryAffiliation: z.string().optional(),
  title: z.array(z.string()).optional(),
})

const FeideGroupSchema = z.object({
  id: z.string(),
  type: z.string(),
  displayName: z.string(),
  membership: FeideGroupMembershipSchema.optional(),
})

const FeideProfileSchema = z.object({
  norEduPersonLegalName: z.string(),
  uid: z.array(z.string()),
  sn: z.array(z.string()).length(1),
  givenName: z.array(z.string()).length(1),
})

export type FeideGroup = z.infer<typeof FeideGroupSchema>
export type FeideProfile = z.infer<typeof FeideProfileSchema>

export interface FeideRepository {
  getFeideGroups(access_token: string): Promise<FeideGroup[]>
  getFeideProfileInformation(access_token: string): Promise<FeideProfile>
}

export class FeideRepositoryImpl implements FeideRepository {
  async getFeideGroups(access_token: string): Promise<FeideGroup[]> {
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

  async getFeideProfileInformation(access_token: string): Promise<FeideProfile> {
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
}
