import { z } from 'zod';

export const EventTypeSchema = z.enum(['SOCIAL','ACADEMIC','COMPANY','BEDPRES']);

export type EventTypeType = `${z.infer<typeof EventTypeSchema>}`

export default EventTypeSchema;
