import type { User, Membership } from "@dotkomonline/types"
import type { DBHandle, Prisma } from "@dotkomonline/db"
import type { GroupRepository } from "../group/group-repository"
import { simplifyGroupMemberships } from "../group/group-service"

// This file implements the logic for merging two user accounts.
//
// HOW TO ADD A NEW FIELD TO USER:
//
// 1. You will get a compile error from `_assertNoMissingFields` below.
//    This means the field must be classified into one of the arrays/objects.
//
// 2. Choose the right classification:
//
//    OMITTED_FIELDS
//      - Completely ignore for the merge. Should only be identity/metadata fields (id, createdAt, ...).
//      - What you need to do:
//          1. Add the field to the array.
//
//    BACKFILL_SCALAR_FIELDS
//      - Nullable scalars. Survivor wins; consumed backfills if survivor is null.
//      - What you need to do:
//          1. Add the field to the array.
//
//    BACKFILL_ONE_TO_ONE_RELATIONS
//      - One-to-one relation FKs (e.g. privacyPermissionsId).
//      - What you need to do:
//          1. Add a { fkField, relationName, deleteOrphan } entry.
//
//    CUSTOM_SCALAR_MERGERS
//      - Scalars that need special logic (e.g. username, flags).
//      - What you need to do:
//          1. Add the field to the object.
//          2. Add a function value.
//
//    REASSIGN_RELATION_HANDLERS
//      - Has-many relations to move from consumed to survivor.
//      - What you need to do:
//          1. Add the field to the object.
//          2. Add a handler function.
//          NOTE: If a User relation maps to multiple FK columns, add one entry per FK column, using the corresponding
//                User relation name as the key.
//
//    CUSTOM_RELATION_MERGERS
//      - Relations needing deduplication logic (memberships, group memberships).
//      - What you need to do:
//          1. Add the field to the object.
//          2. Add a handler function.
//
// =========================================================

// This is all keys of the Prisma User model, including relations (which are not present on the User type)
type AllUserKeys = keyof Prisma.$UserPayload["objects"] | keyof Prisma.$UserPayload["scalars"]

// HELPERS

// TODO: When we update to zod 4, uncomment this and remove the GUID_REGEX. We cannot use .uuid() because we do not
// strictly enforce the UUID format in the database. Some users have GUIDs that are not valid UUIDs.
// const isUuid = (value: string) => z.guid().safeParse(value).success
const GUID_REGEX = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/
const isUuid = (value: string) => GUID_REGEX.test(value)

const buildMembershipDeduplicationKey = (membership: Membership) =>
  `${membership.type}:${membership.specialization ?? "null"}:${membership.semester ?? "null"}`

// FIELD CLASSIFICATION

/**
 * These fields are omitted during the merge.
 */
const OMITTED_FIELDS = [
  "id", //
  "createdAt",
  "updatedAt",
] as const satisfies AllUserKeys[]

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
] as const satisfies AllUserKeys[]

/**
 * One-to-one relations. Survivor's FK wins; if survivor's FK is null, consumed's is adopted.
 *   fkField: the scalar FK column on User
 *   relationName: the Prisma relation object key on User (used only to satisfy the exhaustiveness check)
 *   deleteOrphan: deletes the consumed user's related record when both users have one
 */
const BACKFILL_ONE_TO_ONE_RELATIONS = [
  {
    fkField: "privacyPermissionsId" as const,
    relationName: "privacyPermissions" as const,
    deleteOrphan: (handle: DBHandle, id: string) => handle.privacyPermissions.delete({ where: { id } }),
  },
  {
    fkField: "notificationPermissionsId" as const,
    relationName: "notificationPermissions" as const,
    deleteOrphan: (handle: DBHandle, id: string) => handle.notificationPermissions.delete({ where: { id } }),
  },
] satisfies Array<{
  fkField: AllUserKeys
  relationName: AllUserKeys
  deleteOrphan: (handle: DBHandle, id: string) => Promise<unknown>
}>

/**
 * Scalar fields with custom merge logic.
 */
const CUSTOM_SCALAR_MERGERS = {
  // We take the consumed user's username only if the survivor's is a UUID and the consumed's is not a UUID (meaning
  // it's a custom username).
  username: (survivor: User, consumed: User): string =>
    isUuid(survivor.username) && !isUuid(consumed.username) ? consumed.username : survivor.username,

  // Concatenate and deduplicate
  flags: (survivor: User, consumed: User): string[] => [...new Set([...survivor.flags, ...consumed.flags])],
} satisfies Partial<Record<AllUserKeys, (survivor: User, consumed: User) => unknown>>

/**
 * Has-many relations to reassign from consumed to survivor.
 *
 * If a User relation maps to multiple FK columns (e.g. attendee has userId and paymentRefundedById),
 * add one entry per FK column, using the corresponding User relation name as the key.
 */
const REASSIGN_RELATION_HANDLERS = {
  attendee: async (handle: DBHandle, fromId: string, toId: string) => {
    await handle.attendee.updateMany({
      where: { userId: fromId },
      data: { userId: toId },
    })
  },
  attendeesRefunded: async (handle: DBHandle, fromId: string, toId: string) => {
    await handle.attendee.updateMany({
      where: { paymentRefundedById: fromId },
      data: { paymentRefundedById: toId },
    })
  },
  personalMark: async (handle: DBHandle, fromId: string, toId: string) => {
    await handle.personalMark.updateMany({
      where: { userId: fromId },
      data: { userId: toId },
    })
  },
  givenMarks: async (handle: DBHandle, fromId: string, toId: string) => {
    await handle.personalMark.updateMany({
      where: { givenById: fromId },
      data: { givenById: toId },
    })
  },
  auditLogs: async (handle: DBHandle, fromId: string, toId: string) => {
    await handle.auditLog.updateMany({
      where: { userId: fromId },
      data: { userId: toId },
    })
  },
  deregisterReasons: async (handle: DBHandle, fromId: string, toId: string) => {
    await handle.deregisterReason.updateMany({
      where: { userId: fromId },
      data: { userId: toId },
    })
  },
  notificationsReceived: async (handle: DBHandle, fromId: string, toId: string) => {
    await handle.notificationRecipient.updateMany({
      where: { userId: fromId },
      data: { userId: toId },
    })
  },
  notificationsCreated: async (handle: DBHandle, fromId: string, toId: string) => {
    await handle.notification.updateMany({
      where: { createdById: fromId },
      data: { createdById: toId },
    })
  },
  notificationsUpdated: async (handle: DBHandle, fromId: string, toId: string) => {
    await handle.notification.updateMany({
      where: { lastUpdatedById: fromId },
      data: { lastUpdatedById: toId },
    })
  },
} satisfies Partial<Record<AllUserKeys, (handle: DBHandle, fromId: string, toId: string) => Promise<void>>>

/**
 * Relations with custom merge logic (deduplication).
 */
const CUSTOM_RELATION_MERGERS = {
  memberships: async (handle: DBHandle, _groupRepository: GroupRepository, survivor: User, consumed: User) => {
    const survivorMembershipKeys = new Set(survivor.memberships.map(buildMembershipDeduplicationKey))

    const membershipIdsToTransfer = consumed.memberships
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
          userId: survivor.id,
        },
      })
    }

    // Delete remaining duplicate memberships still owned by the consumed user
    await handle.membership.deleteMany({
      where: {
        userId: consumed.id,
      },
    })
  },

  groupMemberships: async (handle: DBHandle, groupRepository: GroupRepository, survivor: User, consumed: User) => {
    const survivorGroupMemberships = await groupRepository.findManyGroupMemberships(handle, null, survivor.id)
    const consumedGroupMemberships = await groupRepository.findManyGroupMemberships(handle, null, consumed.id)
    const allMemberships = [...survivorGroupMemberships, ...consumedGroupMemberships]

    const newGroupMemberships = simplifyGroupMemberships(allMemberships)
    const allMembershipIds = [...new Set(allMemberships.map((m) => m.id))]

    await groupRepository.deleteGroupMemberships(handle, allMembershipIds)
    await groupRepository.createManyGroupMemberships(handle, newGroupMemberships)
  },
} satisfies Partial<
  Record<
    AllUserKeys,
    (handle: DBHandle, groupRepository: GroupRepository, survivor: User, consumed: User) => Promise<void>
  >
>

// EXHAUSTIVENESS CHECK

type AllAccountedFields =
  | (typeof OMITTED_FIELDS)[number]
  | (typeof BACKFILL_SCALAR_FIELDS)[number]
  | (typeof BACKFILL_ONE_TO_ONE_RELATIONS)[number]["fkField"]
  | (typeof BACKFILL_ONE_TO_ONE_RELATIONS)[number]["relationName"]
  | keyof typeof CUSTOM_SCALAR_MERGERS
  | keyof typeof REASSIGN_RELATION_HANDLERS
  | keyof typeof CUSTOM_RELATION_MERGERS

type MissingFromClassification = Exclude<AllUserKeys, AllAccountedFields>
type ExtraInClassification = Exclude<AllAccountedFields, AllUserKeys>

// These will cause a compile error if there are missing or extra fields in the classification.
// IF YOU COME HERE FROM A TYPE ERROR:
//   Read the comment atop the file for a guide for classifying the field(s) you added to User.
const _assertNoMissingFields: MissingFromClassification extends never ? true : MissingFromClassification = true
const _assertNoExtraFields: ExtraInClassification extends never ? true : ExtraInClassification = true

// IMPLEMENTATION

/**
 * Merges two users into the survivor and consumes the consumer. See method for more information.
 *
 * IMPORTANT: The consumed user will be deleted after the merge.
 *
 * @see UserService#linkAuth0Idenitities for linking the Auth0 identities before merging the database users.
 */
export const mergeUsers = async (
  handle: DBHandle,
  groupRepository: GroupRepository,
  survivorUser: User,
  consumedUser: User
): Promise<void> => {
  // SCALAR BACKFILL
  const scalarUpdates: Record<string, unknown> = {}

  for (const field of BACKFILL_SCALAR_FIELDS) {
    if (survivorUser[field] === null && consumedUser[field] !== null) {
      scalarUpdates[field] = consumedUser[field]
    }
  }

  for (const { fkField } of BACKFILL_ONE_TO_ONE_RELATIONS) {
    if (survivorUser[fkField] === null && consumedUser[fkField] !== null) {
      scalarUpdates[fkField] = consumedUser[fkField]
    }
  }

  for (const [field, merge] of Object.entries(CUSTOM_SCALAR_MERGERS)) {
    scalarUpdates[field] = merge(survivorUser, consumedUser)
  }

  await handle.user.update({
    where: {
      id: survivorUser.id,
    },
    data: scalarUpdates,
  })

  // REASSIGN ALL RELATIONS TO SURVIVOR
  for (const handler of Object.values(REASSIGN_RELATION_HANDLERS)) {
    await handler(handle, consumedUser.id, survivorUser.id)
  }

  // CUSTOM RELATION MERGES
  for (const merge of Object.values(CUSTOM_RELATION_MERGERS)) {
    await merge(handle, groupRepository, survivorUser, consumedUser)
  }

  // DELETE ORPHANED ONE-TO-ONE RELATIONS
  // This happens if both users had a value for the field.
  for (const { fkField, deleteOrphan } of BACKFILL_ONE_TO_ONE_RELATIONS) {
    if (consumedUser[fkField] !== null && survivorUser[fkField] !== null) {
      await deleteOrphan(handle, consumedUser[fkField])
    }
  }

  // CONSUME THE USER >:D
  await handle.user.delete({
    where: {
      id: consumedUser.id,
    },
  })
}
