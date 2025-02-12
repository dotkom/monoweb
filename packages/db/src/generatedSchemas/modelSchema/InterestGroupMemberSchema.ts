import { z } from 'zod';

/////////////////////////////////////////
// INTEREST GROUP MEMBER SCHEMA
/////////////////////////////////////////

export const InterestGroupMemberSchema = z.object({
  interestGroupId: z.string(),
  userId: z.string(),
})

export type InterestGroupMember = z.infer<typeof InterestGroupMemberSchema>

export default InterestGroupMemberSchema;
