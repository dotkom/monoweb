import type { User, Membership } from "@dotkomonline/types"
import { z } from "zod"
import type { DBHandle, Prisma } from "@dotkomonline/db"

// This file implements the logic for merging two user accounts.
//
// HOW TO ADD A NEW FIELD TO USER:
//
// 1. You will get a compile error from `_assertNoMissingFields` below.
//    This means the field must be classified into one of the arrays.
//
// 2. Choose the right classification:
//
//    OMITTED_FIELDS
//      - Completely ignore for the merge. Should only be identity/metadata fields (id, createdAt, ...).
//
//    BACKFILL_SCALAR_FIELDS
//      - Nullable scalars. Survivor wins; consumed backfills if survivor is null.
//
//    BACKFILL_RELATION_FK_FIELDS
//      - One-to-one relation FKs (e.g. privacyPermissionsId).
//      - You MUST also add a cleanup block in the "DELETE ORPHANED RELATIONS" section to delete the consumed user's
//        record when both users have one.
//
//    CUSTOM_MERGE_FIELDS
//      - Scalars that need special logic (e.g. profileSlug, flags).
//      - Add your merge logic in the "CUSTOM SCALAR MERGES" section.
//
//    REASSIGN_RELATION_NAMES
//      - Has-many relations
//      - Add `updateMany` calls in the "REASSIGN ALL RELATIONS" section to move all records from consumed to survivor.
//        - If the relation has multiple FK columns pointing to User (like attendee has userId and paymentRefundedById),
//          add one updateMany per FK column.
//
//    CUSTOM_MERGE_RELATION_NAMES
//      - Relations that need deduplication logic (memberships, group memberships).
//      - Add your merge logic in the corresponding section.
//
// =========================================================

// FIELD CLASSIFICATION

/**
 * These fields are omitted during the merge.
 */
const OMITTED_FIELDS = [
  "id", //
  "createdAt",
  "updatedAt",
] as const satisfies UserKeys[]

/**
 * Keep the survivor's value; if it is null, backfill from the consumed user.
 */
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
 * Keep the survivor's value; if it is null, backfill from the consumed user. The `relation` property is needed for
 * typing purposes.
 *
 * IMPORTANT: Read comment atop the file for instructions.
 */
const BACKFILL_RELATION_FK_FIELDS = [
  { field: "privacyPermissionsId", relation: "privacyPermissions" }, //
  { field: "notificationPermissionsId", relation: "notificationPermissions" },
] as const satisfies { field: UserKeys; relation: UserKeys }[]

/**
 * Fields with custom merge logic.
 *
 * IMPORTANT: Read comment atop the file for instructions.
 */
const CUSTOM_MERGE_FIELDS = [
  "profileSlug", //
  "flags",
] as const satisfies UserKeys[]

/**
 * These relations are reassigned from the consumed user to the survivor.
 *
 * IMPORTANT: Read comment atop the file for instructions.
 */
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

/**
 * Relations with custom merge logic.
 *
 * IMPORTANT: Read comment atop the file for instructions.
 */
const CUSTOM_MERGE_RELATION_NAMES = [
  "memberships", //
  "groupMemberships",
] as const satisfies UserKeys[]

// EXHAUSTIVENESS CHECK

type AllAccountedFields =
  | (typeof OMITTED_FIELDS)[number]
  | (typeof BACKFILL_SCALAR_FIELDS)[number]
  | (typeof BACKFILL_RELATION_FK_FIELDS)[number]["relation"]
  | (typeof BACKFILL_RELATION_FK_FIELDS)[number]["field"]
  | (typeof CUSTOM_MERGE_FIELDS)[number]
  | (typeof REASSIGN_RELATION_NAMES)[number]
  | (typeof CUSTOM_MERGE_RELATION_NAMES)[number]

// This is all keys of the Prisma User model, including relations (which are not present on the User type)
type UserKeys = keyof Prisma.$UserPayload["objects"] | keyof Prisma.$UserPayload["scalars"]

type MissingFromClassification = Exclude<UserKeys, AllAccountedFields>
type ExtraInClassification = Exclude<AllAccountedFields, UserKeys>

// These will cause a compile error if there are missing fields or extra fields in the classification.
// IF YOU COME HERE FROM TYPE ERROR:
//   Read the comment atop the file for a guide for classifying the field(s) you added to User in the above arrays.
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

  for (const { field } of BACKFILL_RELATION_FK_FIELDS) {
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
  if (consumedUser.privacyPermissionsId !== null && survivorUser.privacyPermissionsId !== null) {
    await handle.privacyPermissions.delete({
      where: { id: consumedUser.privacyPermissionsId },
    })
  }

  if (consumedUser.notificationPermissionsId !== null && survivorUser.notificationPermissionsId !== null) {
    await handle.notificationPermissions.delete({
      where: { id: consumedUser.notificationPermissionsId },
    })
  }

  // CONSUME THE USER
  await handle.user.delete({
    where: {
      id: consumedUser.id,
    },
  })
}
