import z from "zod"

export const MINUTES_IN_DAY = 1440

export const ApplicationPeriodSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),

  applicationsStart: z.date(),
  applicationsEnd: z.date(),
  interviewStartDate: z.date(),
  interviewEndDate: z.date(),

  dayStartMinutes: z.number().int().min(0).max(MINUTES_IN_DAY),
  dayEndMinutes: z.number().int().min(0).max(MINUTES_IN_DAY),

  slotLengthMinutes: z.number().int().positive(),
  isDraft: z.boolean(),
  isLocked: z.boolean(),
})

export type ApplicationPeriod = z.infer<typeof ApplicationPeriodSchema>

export const ApplicationPeriodWriteSchema = ApplicationPeriodSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type ApplicationPeriodWrite = z.infer<typeof ApplicationPeriodWriteSchema>

export const formatMinutesOfDay = (minutes: number) => {
  const clamped = Math.max(0, Math.min(MINUTES_IN_DAY, Math.trunc(minutes)))

  return `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`
}

const daysFromNow = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

export const testApplicationPeriods: ApplicationPeriod[] = [
  {
    // Applications open right now
    id: "ap-1",
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-10),
    name: "Komitéopptak høst",
    isDraft: false,
    isLocked: false,
    applicationsStart: daysFromNow(-5),
    applicationsEnd: daysFromNow(9),
    interviewStartDate: daysFromNow(12),
    interviewEndDate: daysFromNow(20),
    dayStartMinutes: 480,
    dayEndMinutes: 1320,
    slotLengthMinutes: 10,
  },
  {
    // Applications closed, interviews ongoing
    id: "ap-2",
    createdAt: daysFromNow(-60),
    updatedAt: daysFromNow(-40),
    name: "Ekstraopptak",
    isDraft: false,
    isLocked: true,
    applicationsStart: daysFromNow(-20),
    applicationsEnd: daysFromNow(-6),
    interviewStartDate: daysFromNow(-3),
    interviewEndDate: daysFromNow(4),
    dayStartMinutes: 540,
    dayEndMinutes: 1020,
    slotLengthMinutes: 20,
  },
  {
    // Upcoming, not open yet
    id: "ap-3",
    createdAt: daysFromNow(-7),
    updatedAt: daysFromNow(-2),
    name: "Komitéopptak vår",
    isDraft: false,
    isLocked: false,
    applicationsStart: daysFromNow(30),
    applicationsEnd: daysFromNow(44),
    interviewStartDate: daysFromNow(47),
    interviewEndDate: daysFromNow(55),
    dayStartMinutes: 480,
    dayEndMinutes: 1320,
    slotLengthMinutes: 10,
  },
  {
    // Finished
    id: "ap-4",
    createdAt: daysFromNow(-200),
    updatedAt: daysFromNow(-150),
    name: "Komitéopptak vår (forrige)",
    isDraft: false,
    isLocked: false,
    applicationsStart: daysFromNow(-180),
    applicationsEnd: daysFromNow(-166),
    interviewStartDate: daysFromNow(-163),
    interviewEndDate: daysFromNow(-155),
    dayStartMinutes: 600,
    dayEndMinutes: 1200,
    slotLengthMinutes: 15,
  },
  {
    // Draft with dates that would be active; should still be hidden
    id: "ap-5",
    createdAt: daysFromNow(-3),
    updatedAt: daysFromNow(-1),
    name: "Utkast: nytt opptak",
    isDraft: true,
    isLocked: false,
    applicationsStart: daysFromNow(-1),
    applicationsEnd: daysFromNow(13),
    interviewStartDate: daysFromNow(16),
    interviewEndDate: daysFromNow(24),
    dayStartMinutes: 480,
    dayEndMinutes: 1320,
    slotLengthMinutes: 10,
  },
]
