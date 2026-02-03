import type { User, Membership } from "@dotkomonline/types"
import { z } from "zod"
import type { DBHandle, Prisma } from "@dotkomonline/db"

// This file implements the logic for merging two user accounts.
//
// It is split into three parts:
//   1. Field classification (how they will be merged)
//   2. A type check to make sure every field is classified (exhaustiveness check)
//   3. The merge implementation
//
// In general, we keep everything from the survivor user, and backfill from the consumed user only when the survivor has
// null/empty values. We have some custom logic for memberships and other fields.

// FIELD CLASSIFICATION

/** These fields are omitted during the merge. */
const OMITTED_FIELDS = [
  "id", //
  "createdAt",
  "updatedAt",
] as const satisfies UserKeys[]

/** Keep the survivor's value; if it is null, backfill from the consumed user. */
const BACKFILL_SCALAR_FIELDS = [
  "name",
  "email",
  "imageUrl",
  "biography",
  "phone",
  "gender",
  "dietaryRestrictions",
  "ntnuUsername",
  "workspaceUserId",
] as const satisfies UserKeys[]

/**
 * Keep the survivor's value; if it is null, backfill from the consumed user.
 *
 * These fields should be cleaned if orphaned after the merge. Remember to update BACKFILL_RELATION_NAMES as well.
 */
const BACKFILL_RELATION_FK_FIELDS = [
  "privacyPermissionsId", //
  "notificationPermissionsId",
] as const satisfies UserKeys[]
/** Needed for type checking */
const BACKFILL_RELATION_NAMES = [
  "privacyPermissions", //
  "notificationPermissions",
] as const satisfies UserKeys[]

/** Fields with custom merge logic. */
const CUSTOM_MERGE_FIELDS = [
  "profileSlug", //
  "flags",
] as const satisfies UserKeys[]

/** These relations are reassigned from the consumed user to the survivor. */
const REASSIGN_RELATION_NAMES = [
  "attendee",
  "personalMark",
  "givenMarks",
  "attendeesRefunded",
  "auditLogs",
  "deregisterReasons",
  "notificationsUpdated",
  "notificationsReceived",
  "notificationsCreated",
] as const satisfies UserKeys[]

/** Relations with custom merge logic. */
const CUSTOM_MERGE_RELATION_NAMES = [
  "memberships", //
  "groupMemberships",
] as const satisfies UserKeys[]

// EXHAUSTIVENESS CHECK

type AllAccountedFields =
  | (typeof OMITTED_FIELDS)[number]
  | (typeof BACKFILL_SCALAR_FIELDS)[number]
  | (typeof BACKFILL_RELATION_FK_FIELDS)[number]
  | (typeof BACKFILL_RELATION_NAMES)[number]
  | (typeof CUSTOM_MERGE_FIELDS)[number]
  | (typeof REASSIGN_RELATION_NAMES)[number]
  | (typeof CUSTOM_MERGE_RELATION_NAMES)[number]

// This is all keys of the Prisma User model, including relations (which are not present on the User type)
type UserKeys = keyof Prisma.$UserPayload["objects"] | keyof Prisma.$UserPayload["scalars"]

type MissingFromClassification = Exclude<UserKeys, AllAccountedFields>
type ExtraInClassification = Exclude<AllAccountedFields, UserKeys>

// These will cause a compile error if they are anything other than `never`
// IF YOU COME HERE FROM TYPE ERROR: You need to classify the field(s) you added in the above arrays.
const _assertNoMissingFields: MissingFromClassification extends never ? true : MissingFromClassification = true
const _assertNoExtraFields: ExtraInClassification extends never ? true : ExtraInClassification = true

// IMPLEMENTATION

const isUuid = (value: string) => z.string().uuid().safeParse(value).success

const buildMembershipDeduplicationKey = (membership: Membership) => {
  return `${membership.type}:${membership.specialization ?? "null"}:${membership.semester ?? "null"}`
}

export const mergeUsers = async (handle: DBHandle, survivorUser: User, consumedUser: User): Promise<void> => {
  // SCALAR BACKFILL
  // Fills null fields on survivor from consumed
  const scalarUpdates: Record<string, unknown> = {}

  for (const field of BACKFILL_SCALAR_FIELDS) {
    if (survivorUser[field] === null && consumedUser[field] !== null) {
      scalarUpdates[field] = consumedUser[field]
    }
  }

  for (const field of BACKFILL_RELATION_FK_FIELDS) {
    if (survivorUser[field] === null && consumedUser[field] !== null) {
      scalarUpdates[field] = consumedUser[field]
    }
  }

  // profileSlug rule: adopt consumed user's slug only if survivor's is a UUID and consumed's is not
  if (isUuid(survivorUser.profileSlug) && !isUuid(consumedUser.profileSlug)) {
    scalarUpdates.profileSlug = consumedUser.profileSlug
  }

  // flags rule: concat and deduplicate
  scalarUpdates.flags = [...new Set([...survivorUser.flags, ...consumedUser.flags])]

  await handle.user.update({
    where: {
      id: survivorUser.id,
    },
    data: scalarUpdates,
  })

  // MERGE MEMBERSHIPS
  // We want to avoid duplicate memberships.
  const survivorMembershipKeys = new Set(survivorUser.memberships.map(buildMembershipDeduplicationKey))

  const membershipIdsToTransfer = consumedUser.memberships
    .filter((membership) => !survivorMembershipKeys.has(buildMembershipDeduplicationKey(membership)))
    .map((membership) => membership.id)

  if (membershipIdsToTransfer.length > 0) {
    await handle.membership.updateMany({
      where: {
        id: {
          in: membershipIdsToTransfer,
        },
      },
      data: {
        userId: survivorUser.id,
      },
    })
  }

  // Delete remaining duplicate memberships still owned by the consumed user
  await handle.membership.deleteMany({
    where: { userId: consumedUser.id },
  })

  // MERGE GROUP MEMBERSHIPS
  const survivorGroupMemberships = await handle.groupMembership.findMany({
    where: {
      userId: survivorUser.id,
    },
  })
  const consumedGroupMemberships = await handle.groupMembership.findMany({
    where: {
      userId: consumedUser.id,
    },
  })

  const survivorActiveGroupIds = new Set(
    survivorGroupMemberships
      .filter((groupMembership) => groupMembership.end === null)
      .map((groupMembership) => groupMembership.groupId)
  )

  // Transfer group memberships unless both users have an active membership in the same group
  const groupMembershipIdsToTransfer = consumedGroupMemberships
    .filter((groupMembership) => {
      const isActive = groupMembership.end === null
      const survivorAlreadyActiveInGroup = survivorActiveGroupIds.has(groupMembership.groupId)
      return !(isActive && survivorAlreadyActiveInGroup)
    })
    .map((groupMembership) => groupMembership.id)

  if (groupMembershipIdsToTransfer.length > 0) {
    await handle.groupMembership.updateMany({
      where: {
        id: {
          in: groupMembershipIdsToTransfer,
        },
      },
      data: {
        userId: survivorUser.id,
      },
    })
  }

  // Delete remaining duplicate group memberships still owned by the consumed user
  await handle.groupMembership.deleteMany({
    where: {
      userId: consumedUser.id,
    },
  })

  // REASSIGN ALL RELATIONS TO SURVIVOR
  // Attendees (both "attended" and "refunded by" relations)
  await handle.attendee.updateMany({
    where: {
      userId: consumedUser.id,
    },
    data: {
      userId: survivorUser.id,
    },
  })
  await handle.attendee.updateMany({
    where: {
      paymentRefundedById: consumedUser.id,
    },
    data: {
      paymentRefundedById: survivorUser.id,
    },
  })

  // Personal marks (received and given)
  await handle.personalMark.updateMany({
    where: {
      userId: consumedUser.id,
    },
    data: {
      userId: survivorUser.id,
    },
  })
  await handle.personalMark.updateMany({
    where: {
      givenById: consumedUser.id,
    },
    data: {
      givenById: survivorUser.id,
    },
  })

  // Audit logs
  await handle.auditLog.updateMany({
    where: {
      userId: consumedUser.id,
    },
    data: {
      userId: survivorUser.id,
    },
  })

  // Deregister reasons
  await handle.deregisterReason.updateMany({
    where: {
      userId: consumedUser.id,
    },
    data: {
      userId: survivorUser.id,
    },
  })

  // Notifications (received, created, updated)
  await handle.notificationRecipient.updateMany({
    where: {
      userId: consumedUser.id,
    },
    data: {
      userId: survivorUser.id,
    },
  })
  await handle.notification.updateMany({
    where: {
      createdById: consumedUser.id,
    },
    data: {
      createdById: survivorUser.id,
    },
  })
  await handle.notification.updateMany({
    where: {
      lastUpdatedById: consumedUser.id,
    },
    data: {
      lastUpdatedById: survivorUser.id,
    },
  })

  // DELETE ORPHANED RELATIONS
  // If we adopted the consumed user's privacy/notification permissions via
  // the FK backfill, they are already pointing at the survivor. If not,
  // we need to delete the consumed user's orphaned permission records.
  if (consumedUser.privacyPermissionsId !== null && survivorUser.privacyPermissionsId !== null) {
    await handle.privacyPermissions.delete({
      where: {
        id: consumedUser.privacyPermissionsId,
      },
    })
  }

  if (consumedUser.notificationPermissionsId !== null && survivorUser.notificationPermissionsId !== null) {
    await handle.notificationPermissions.delete({
      where: {
        id: consumedUser.notificationPermissionsId,
      },
    })
  }

  // CONSUME THE USER
  await handle.user.delete({
    where: {
      id: consumedUser.id,
    },
  })
}
