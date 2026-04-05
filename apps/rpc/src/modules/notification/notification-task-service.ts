import type { DBHandle } from "@dotkomonline/db"
import { isAfter, isBefore, subDays, addHours } from "date-fns"
import { createEventSlug } from "@dotkomonline/utils"
import type { AttendanceRepository } from "../event/attendance-repository"
import type { EventRepository } from "../event/event-repository"
import type {
  InferTaskData,
  SendNotificationEventRegistrationTaskDefinition,
  SendNotificationEventReminderTaskDefinition,
  SendNotificationJobListingReminderTaskDefinition,
} from "../task/task-definition"
import type { NotificationService } from "./notification-service"

export interface NotificationTaskService {
  executeEventRegistrationNotificationTask(
    handle: DBHandle,
    data: InferTaskData<SendNotificationEventRegistrationTaskDefinition>
  ): Promise<void>
  executeEventReminderNotificationTask(
    handle: DBHandle,
    data: InferTaskData<SendNotificationEventReminderTaskDefinition>
  ): Promise<void>
  executeJobListingReminderNotificationTask(
    handle: DBHandle,
    data: InferTaskData<SendNotificationJobListingReminderTaskDefinition>
  ): Promise<void>
}

export function getNotificationTaskService(
  notificationService: NotificationService,
  attendanceRepository: AttendanceRepository,
  eventRepository: EventRepository
): NotificationTaskService {
  return {
    async executeEventRegistrationNotificationTask(handle, { attendanceId }) {
      const attendance = await attendanceRepository.findAttendanceById(handle, attendanceId)
      if (!attendance) return

      // Verify registration has actually opened (with a small grace window for task scheduling jitter)
      const now = new Date()
      if (isAfter(attendance.registerStart, addHours(now, 0.1))) return

      const event = await eventRepository.findByAttendanceId(handle, attendanceId)
      if (!event) return

      const recipients = await notificationService.retrieveIntendedRecipientIds(handle, "EVENT_REGISTRATION")
      await notificationService.create(
        handle,
        recipients,
        "EVENT_REGISTRATION",
        `Påmelding åpnet: ${event.title}`,
        `Påmeldingen til arrangementet "${event.title}" er nå åpen.`,
        event.hostingGroups[0]?.slug ?? null,
        "EVENT",
        `${createEventSlug(event.title)}/${event.id}`
      )
    },

    async executeEventReminderNotificationTask(handle, { eventId }) {
      const event = await eventRepository.findById(handle, eventId)
      if (!event) return

      // Verify the event actually starts within the next ~48 hours (tolerant window around "1 day before")
      const now = new Date()
      const windowStart = subDays(now, 1)
      const windowEnd = addHours(now, 48)
      if (isBefore(event.start, windowStart) || isAfter(event.start, windowEnd)) return

      const recipients = await notificationService.retrieveIntendedRecipientIds(handle, "EVENT_REMINDER", eventId)
      await notificationService.create(
        handle,
        recipients,
        "EVENT_REMINDER",
        `Påminnelse: ${event.title}`,
        `Arrangementet "${event.title}" starter i morgen.`,
        event.hostingGroups[0]?.slug ?? null,
        "EVENT",
        `${createEventSlug(event.title)}/${event.id}`
      )
    },

    async executeJobListingReminderNotificationTask(handle, { jobListingId, title }) {
      const recipients = await notificationService.retrieveIntendedRecipientIds(handle, "JOB_LISTING_REMINDER")
      await notificationService.create(
        handle,
        recipients,
        "JOB_LISTING_REMINDER",
        `Frist nærmer seg: ${title}`,
        `Fristen for stillingsutlysningen "${title}" nærmer seg.`,
        null,
        "JOB_LISTING",
        jobListingId
      )
    },
  }
}
