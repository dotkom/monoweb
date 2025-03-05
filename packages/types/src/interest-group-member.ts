import { z } from "zod"

export const InterestGroupMemberSchema = z.object({
  interestGroupId: z.string(),
  userId: z.string(),
})

export type InterestGroupMember = z.infer<typeof InterestGroupMemberSchema>

export const InterestGroupMemberWriteSchema = InterestGroupMemberSchema

export type InterestGroupMemberWrite = z.infer<typeof InterestGroupMemberWriteSchema>
