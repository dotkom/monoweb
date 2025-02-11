import { z } from 'zod';

export const EventStatusSchema = z.enum(['TBA','PUBLIC','NO_LIMIT','ATTENDANCE']);

export type EventStatusType = `${z.infer<typeof EventStatusSchema>}`

export default EventStatusSchema;
