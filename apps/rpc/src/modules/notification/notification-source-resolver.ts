import type { DBHandle } from "@dotkomonline/db"
import { InvalidArgumentError } from "../../error"
import type { ArticleService } from "../article/article-service"
import type { EventService } from "../event/event-service"
import type { GroupService } from "../group/group-service"
import type { JobListingService } from "../job-listing/job-listing-service"
import type { OfflineService } from "../offline/offline-service"
import type { UserService } from "../user/user-service"
import {
  NotificationGlobalLinkSchema,
  type NotificationGlobalLink,
  type NotificationLink,
  type NotificationRecipientSelection,
  type NotificationSource,
} from "./notification"

export interface NotificationSourceServices {
  eventService: Pick<EventService, "getEventById">
  articleService: Pick<ArticleService, "getBySlug">
  groupService: Pick<GroupService, "getBySlug">
  userService: Pick<UserService, "getById">
  offlineService: Pick<OfflineService, "getById">
  jobListingService: Pick<JobListingService, "getById">
}

export interface ResolvedNotificationSource {
  link: NotificationLink
  defaultRecipientSelection: NotificationRecipientSelection | null
}

export function getNotificationSourceResolver(services: NotificationSourceServices) {
  return {
    async resolve(
      handle: DBHandle,
      input: { source: NotificationSource; link?: NotificationGlobalLink }
    ): Promise<ResolvedNotificationSource> {
      if (input.source.type === "GLOBAL") {
        const result = NotificationGlobalLinkSchema.safeParse(input.link ?? { type: "NONE" })

        if (!result.success) {
          throw new InvalidArgumentError("Global notifications can only have no link or a URL")
        }

        return {
          link: result.data,
          defaultRecipientSelection: null,
        }
      }

      if (input.link !== undefined && input.link.type !== "NONE") {
        throw new InvalidArgumentError("Notifications from a specific context have a fixed link")
      }

      const source = input.source

      switch (source.type) {
        case "EVENT": {
          const event = await services.eventService.getEventById(handle, source.eventId)
          let defaultRecipientSelection: NotificationRecipientSelection | null = null

          if (event.attendanceId !== null) {
            defaultRecipientSelection = {
              rules: [
                {
                  type: "EVENT_ATTENDEES",
                  attendanceId: event.attendanceId,
                  reservationStatus: "RESERVED",
                  paymentStatus: "ALL",
                },
              ],
              excludedUserIds: [],
            }
          }

          return {
            link: {
              type: "EVENT",
              eventId: event.id,
            },
            defaultRecipientSelection,
          }
        }

        case "ARTICLE": {
          const article = await services.articleService.getBySlug(handle, source.articleSlug)

          return {
            link: {
              type: "ARTICLE",
              articleSlug: article.slug,
            },
            defaultRecipientSelection: null,
          }
        }

        case "GROUP": {
          const group = await services.groupService.getBySlug(handle, source.groupSlug)

          return {
            link: {
              type: "GROUP",
              groupSlug: group.slug,
            },
            defaultRecipientSelection: null,
          }
        }

        case "USER": {
          const user = await services.userService.getById(handle, source.userId)

          return {
            link: {
              type: "USER",
              userId: user.id,
            },
            defaultRecipientSelection: null,
          }
        }

        case "OFFLINE": {
          const offline = await services.offlineService.getById(handle, source.offlineId)

          return {
            link: {
              type: "OFFLINE",
              offlineId: offline.id,
            },
            defaultRecipientSelection: null,
          }
        }

        case "JOB_LISTING": {
          const jobListing = await services.jobListingService.getById(handle, source.jobListingId)

          return {
            link: {
              type: "JOB_LISTING",
              jobListingId: jobListing.id,
            },
            defaultRecipientSelection: null,
          }
        }
      }
    },
  }
}
