import { z } from 'zod';

export const WaitlistAttendeeScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','attendanceId','userId','position','isPunished','registeredAt','studyYear','attendancePoolId','name']);

export default WaitlistAttendeeScalarFieldEnumSchema;
