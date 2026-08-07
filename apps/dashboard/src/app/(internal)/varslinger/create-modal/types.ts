import type { NotificationPayloadType, NotificationType } from "@dotkomonline/rpc"
import {
  createEmptyAudience,
  createEventRule,
  createGroupRule,
  type AudienceState,
} from "./audience-model"

export type NotificationCreateSource = "global" | "event" | "group"

export type NotificationTypeMode = "broadcast" | "task"

export type DestinationOption = {
  payloadType: NotificationPayloadType
  payload: string | null
  label: string
}

export type ActorGroupOption = {
  slug: string
  label: string
}

export type CreateNotificationLaunchContext = {
  source: NotificationCreateSource
  typeMode: NotificationTypeMode
  type: NotificationType
  typeLocked?: boolean
  destination: DestinationOption
  destinationLocked?: boolean
  actorGroupId: string | null
  actorGroupOptions?: ActorGroupOption[]
  actorGroupLocked?: boolean
  initialAudience?: AudienceState
  invalidatePayload?: {
    payloadType: NotificationPayloadType
    payload: string
  }
}

export type CreateNotificationFormState = {
  title: string
  shortDescription: string
  content: string
  type: NotificationType
  typeMode: NotificationTypeMode
  typeLocked: boolean
  destination: DestinationOption
  destinationLocked: boolean
  actorGroupId: string | null
  actorGroupOptions: ActorGroupOption[]
  actorGroupLocked: boolean
  audience: AudienceState
}

export const SHORT_DESCRIPTION_MAX_LENGTH = 160

export function createInitialFormState(context: CreateNotificationLaunchContext): CreateNotificationFormState {
  return {
    title: "",
    shortDescription: "",
    content: "",
    type: context.type,
    typeMode: context.typeMode,
    typeLocked: context.typeLocked ?? context.typeMode === "task",
    destination: context.destination,
    destinationLocked: context.destinationLocked ?? context.source !== "global",
    actorGroupId: context.actorGroupId,
    actorGroupOptions: context.actorGroupOptions ?? [],
    actorGroupLocked: context.actorGroupLocked ?? false,
    audience: context.initialAudience ?? createEmptyAudience(),
  }
}

export function createGlobalLaunchContext(): CreateNotificationLaunchContext {
  return {
    source: "global",
    typeMode: "broadcast",
    type: "BROADCAST",
    destination: {
      payloadType: "NONE",
      payload: null,
      label: "Ingen destinasjon",
    },
    destinationLocked: false,
    actorGroupId: null,
    actorGroupLocked: false,
  }
}

export function createEventLaunchContext(input: {
  eventId: string
  eventTitle: string
  eventPath: string
  type: NotificationType
  hostingGroups: ActorGroupOption[]
  eligibleGroupSlugs: string[]
  attendanceMembers?: Array<{ userId: string; name: string | null; reserved: boolean }>
}): CreateNotificationLaunchContext {
  const eligibleHostingGroups = input.hostingGroups.filter((group) =>
    input.eligibleGroupSlugs.includes(group.slug)
  )
  const actorGroupOptions = eligibleHostingGroups
  const primaryActorGroup = actorGroupOptions[0] ?? null

  const initialAudience =
    input.attendanceMembers !== undefined && input.attendanceMembers.length > 0
      ? {
          rules: [
            createEventRule({
              eventId: input.eventId,
              eventTitle: input.eventTitle,
              members: input.attendanceMembers,
              includeReserved: true,
              includeUnreserved: true,
            }),
          ],
          excludedUserIds: [],
          excludedMembers: [],
        }
      : createEmptyAudience()

  return {
    source: "event",
    typeMode: "task",
    type: input.type,
    typeLocked: true,
    destination: {
      payloadType: "EVENT",
      payload: input.eventPath,
      label: `Arrangement: ${input.eventTitle}`,
    },
    destinationLocked: true,
    actorGroupId: primaryActorGroup?.slug ?? null,
    actorGroupOptions,
    actorGroupLocked: actorGroupOptions.length <= 1,
    initialAudience,
    invalidatePayload: {
      payloadType: "EVENT",
      payload: input.eventPath,
    },
  }
}

export function createGroupLaunchContext(input: {
  groupSlug: string
  groupLabel: string
  members: Array<{ userId: string; name: string | null; isActive: boolean }>
}): CreateNotificationLaunchContext {
  return {
    source: "group",
    typeMode: "broadcast",
    type: "BROADCAST",
    typeLocked: false,
    destination: {
      payloadType: "GROUP",
      payload: input.groupSlug,
      label: `Gruppe: ${input.groupLabel}`,
    },
    destinationLocked: true,
    actorGroupId: input.groupSlug,
    actorGroupOptions: [{ slug: input.groupSlug, label: input.groupLabel }],
    actorGroupLocked: true,
    initialAudience: {
      rules: [
        createGroupRule({
          groupSlug: input.groupSlug,
          groupLabel: input.groupLabel,
          members: input.members,
          includeActive: true,
          includeInactive: false,
        }),
      ],
      excludedUserIds: [],
      excludedMembers: [],
    },
    invalidatePayload: {
      payloadType: "GROUP",
      payload: input.groupSlug,
    },
  }
}

export function formatDestinationLabel(destination: DestinationOption): string {
  if (destination.payloadType === "NONE" || destination.payload === null) {
    return "Ingen destinasjon"
  }

  if (destination.label.length > 0) {
    return destination.label
  }

  if (destination.payloadType === "URL") {
    return `Ekstern URL: ${destination.payload}`
  }

  if (destination.payloadType === "EVENT") {
    return `Arrangement: ${destination.payload}`
  }

  if (destination.payloadType === "GROUP") {
    return `Gruppe: ${destination.payload}`
  }

  if (destination.payloadType === "ARTICLE") {
    return `Artikkel: ${destination.payload}`
  }

  return destination.payload
}
