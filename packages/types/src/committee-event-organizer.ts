import { z } from "zod"

export const CommiteeOrganizerSchema = z.object({
  committeeId: z.string(),
  eventId: z.string(),
})

export type CommitteeOrganizer = z.infer<typeof CommiteeOrganizerSchema>

export const CommitteeEventOrganizerWriteSchema = CommiteeOrganizerSchema

export type CommitteeEventOrganizerWrite = z.infer<typeof CommitteeEventOrganizerWriteSchema>
