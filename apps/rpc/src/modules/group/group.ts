import { compareDesc } from "date-fns"
import { z } from "zod"
import { UserSchema } from "../user/user"

export const GroupTypeSchema = z.enum(["COMMITTEE", "NODE_COMMITTEE", "ASSOCIATED", "INTEREST_GROUP", "EMAIL_ONLY"])
export type GroupType = z.infer<typeof GroupTypeSchema>

export const GroupRecruitmentMethodSchema = z.enum([
  "NONE",
  "SPRING_APPLICATION",
  "AUTUMN_APPLICATION",
  "GENERAL_ASSEMBLY",
  "NOMINATION",
  "OTHER",
])
export type GroupRecruitmentMethod = z.output<typeof GroupRecruitmentMethodSchema>

export const GroupMemberVisibilitySchema = z.enum(["ALL_MEMBERS", "WITH_ROLES", "LEADER", "NONE"])
export type GroupMemberVisibilityType = z.infer<typeof GroupMemberVisibilitySchema>

export const GroupPreferredDisplayNameSchema = z.enum(["ABBREVIATION", "NAME"])
export type GroupPreferredDisplayName = z.infer<typeof GroupPreferredDisplayNameSchema>

export const GroupRoleTypeSchema = z.enum([
  "LEADER",
  "PUNISHER",
  "TREASURER",
  "COSMETIC",
  "DEPUTY_LEADER",
  "TRUSTEE",
  "EMAIL_ONLY",
  "TEMPORARILY_LEAVE",
])
export const GroupRoleTypeEnum = GroupRoleTypeSchema.enum
export type GroupRoleType = z.infer<typeof GroupRoleTypeSchema>

export const GroupRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: GroupRoleTypeSchema.default("COSMETIC"),
  groupId: z.string(),
})
export type GroupRole = z.infer<typeof GroupRoleSchema>
export type GroupRoleId = GroupRole["id"]

export const GroupRoleWriteSchema = GroupRoleSchema.pick({
  groupId: true,
  name: true,
  type: true,
})
export type GroupRoleWrite = z.infer<typeof GroupRoleWriteSchema>

export const GroupSchema = z.object({
  slug: z.string(),
  abbreviation: z.string(),
  name: z.string().nullable(),
  preferredDisplayName: GroupPreferredDisplayNameSchema.default("ABBREVIATION"),
  shortDescription: z.string().nullable(),
  description: z.string(),
  imageUrl: z.string().nullable(),
  email: z.string().nullable(),
  contactUrl: z.string().nullable(),
  slackUrl: z.string().nullable(),
  showLeaderAsContact: z.boolean(),
  createdAt: z.date(),
  deactivatedAt: z.date().nullable(),
  workspaceGroupId: z.string().nullable(),
  memberVisibility: GroupMemberVisibilitySchema.default("ALL_MEMBERS"),
  recruitmentMethod: GroupRecruitmentMethodSchema.default("NONE"),
  type: GroupTypeSchema,
  roles: GroupRoleSchema.array(),
  eventCount: z.number().optional(),
})

export type GroupId = Group["slug"]
export type Group = z.infer<typeof GroupSchema>

export const GroupByMemberFilterSchema = z.object({
  includeEmailGroups: z.boolean().optional(),
  includeEmailOnlyMemberships: z.boolean().optional(),
})
export type GroupByMemberFilter = z.infer<typeof GroupByMemberFilterSchema>

export const GroupWriteSchema = GroupSchema.pick({
  type: true,
  name: true,
  slug: true,
  abbreviation: true,
  preferredDisplayName: true,
  description: true,
  imageUrl: true,
  email: true,
  contactUrl: true,
  slackUrl: true,
  showLeaderAsContact: true,
  memberVisibility: true,
  deactivatedAt: true,
  workspaceGroupId: true,
  recruitmentMethod: true,
}).partial({
  slug: true,
})

export type GroupWrite = z.infer<typeof GroupWriteSchema>

export const GroupMembershipSchema = z
  .object({
    id: z.string(),
    start: z.date(),
    end: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    groupId: z.string(),
    userId: z.string(),
  })
  .extend({
    roles: GroupRoleSchema.array(),
  })

export const GroupMemberSchema = UserSchema.extend({
  groupMemberships: GroupMembershipSchema.array(),
})
export type GroupMember = z.infer<typeof GroupMemberSchema>

export type GroupMembership = z.infer<typeof GroupMembershipSchema>

export const GroupMembershipWriteSchema = GroupMembershipSchema.omit({
  roles: true,
  id: true,
  createdAt: true,
  updatedAt: true,
})
export type GroupMembershipId = GroupMembership["id"]
export type GroupMembershipWrite = z.infer<typeof GroupMembershipWriteSchema>

export const GroupMembershipWriteWithRolesSchema = GroupMembershipWriteSchema.extend({
  roleIds: z.set(GroupRoleSchema.shape.id),
})
export type GroupMembershipWriteWithRoles = z.infer<typeof GroupMembershipWriteWithRolesSchema>

export const getDefaultGroupMemberRoles = (groupId: GroupId) =>
  [
    { groupId, type: GroupRoleTypeEnum.LEADER, name: "Leder" },
    { groupId, type: GroupRoleTypeEnum.PUNISHER, name: "Vinstraffansvarlig" },
    { groupId, type: GroupRoleTypeEnum.DEPUTY_LEADER, name: "Nestleder" },
    { groupId, type: GroupRoleTypeEnum.TRUSTEE, name: "Tillitsvalgt" },
    { groupId, type: GroupRoleTypeEnum.TREASURER, name: "Økonomiansvarlig" },
    { groupId, type: GroupRoleTypeEnum.COSMETIC, name: "Medlem" },
    { groupId, type: GroupRoleTypeEnum.EMAIL_ONLY, name: "E-postbruker" },
    { groupId, type: GroupRoleTypeEnum.TEMPORARILY_LEAVE, name: "Permitert" },
  ] as const satisfies GroupRoleWrite[]

export const getGroupDisplayName = (group: Pick<Group, "abbreviation" | "name" | "preferredDisplayName">) => {
  if (group.preferredDisplayName === "NAME") {
    return group.name ?? group.abbreviation
  }

  return group.abbreviation
}

export const getGroupSecondaryName = (group: Pick<Group, "abbreviation" | "name" | "preferredDisplayName">) => {
  const displayName = getGroupDisplayName(group)
  const otherName = group.preferredDisplayName === "NAME" ? group.abbreviation : group.name

  if (!otherName || otherName === displayName) {
    return null
  }

  return otherName
}

export const getGroupPreferredDisplayNameLabel = (preferredDisplayName: GroupPreferredDisplayName): string => {
  switch (preferredDisplayName) {
    case "ABBREVIATION":
      return "Kort navn"
    case "NAME":
      return "Offisielt navn"
  }
}

export const createGroupPageUrl = (group: Group): string => {
  switch (group.type) {
    case "COMMITTEE":
    case "NODE_COMMITTEE":
    case "ASSOCIATED":
    case "EMAIL_ONLY":
      return `/grupper/${group.slug}`
    case "INTEREST_GROUP":
      return `/interessegrupper/${group.slug}`
  }
}

export const getGroupTypeName = (type: GroupType | null | undefined): string => {
  if (type == null) {
    return "Ukjent"
  }

  switch (type) {
    case "COMMITTEE":
      return "Komité"
    case "NODE_COMMITTEE":
      return "Nodekomité"
    case "ASSOCIATED":
      return "Assosiert gruppe"
    case "INTEREST_GROUP":
      return "Interessegruppe"
    case "EMAIL_ONLY":
      return "E-postgruppe"
  }
}

export const getGroupMemberVisibilityName = (name: GroupMemberVisibilityType | null | undefined): string => {
  if (name == null) {
    return "Ukjent"
  }

  switch (name) {
    case "ALL_MEMBERS":
      return "Alle medlemmer"
    case "WITH_ROLES":
      return "Alle med roller"
    case "LEADER":
      return "Kun leder"
    case "NONE":
      return "Ingen"
  }
}

export const getGroupRoleTypeName = (type: GroupRoleType): string => {
  switch (type) {
    case GroupRoleTypeEnum.LEADER:
      return "Leder"
    case GroupRoleTypeEnum.PUNISHER:
      return "Vinstraffansvarlig"
    case GroupRoleTypeEnum.COSMETIC:
      return "Kosmetisk"
    case GroupRoleTypeEnum.DEPUTY_LEADER:
      return "Nestleder"
    case GroupRoleTypeEnum.TRUSTEE:
      return "Tillitsvalgt"
    case GroupRoleTypeEnum.TREASURER:
      return "Økonomiansvarlig"
    case GroupRoleTypeEnum.EMAIL_ONLY:
      return "E-postbruker"
    case GroupRoleTypeEnum.TEMPORARILY_LEAVE:
      return "Permitert"
  }
}

export const getGroupRecruitmentMethodName = (recruitmentMethod: GroupRecruitmentMethod): string => {
  switch (recruitmentMethod) {
    case "GENERAL_ASSEMBLY":
      return "Generalforsamling"
    case "AUTUMN_APPLICATION":
      return "Opptak ved høsten"
    case "NOMINATION":
      return "Nominasjoner"
    case "NONE":
      return "Ingen opptak"
    case "OTHER":
      return "Annet ordinært opptak"
    case "SPRING_APPLICATION":
      return "Opptak ved våren"
  }
}

// TODO: Maybe this should check if membership.end is in the future?
export const isGroupMembershipActive = (membership: GroupMembership): boolean => {
  return membership.end === null
}

export const isGroupMemberActive = (member: GroupMember | null, groupId?: GroupId): boolean => {
  if (member === null) {
    return false
  }

  return findActiveGroupMembership(member, groupId) !== null
}

export function findActiveGroupMembershipIn(
  groupMemberships: GroupMembership[],
  groupId?: GroupId
): GroupMembership | null {
  const activeMemberships = groupMemberships
    .toSorted((a, b) => compareDesc(a.start, b.start))
    .filter((membership) => isGroupMembershipActive(membership))

  if (groupId === undefined) {
    return activeMemberships.at(0) ?? null
  }

  return activeMemberships.find((membership) => membership.groupId === groupId) ?? null
}

export function findActiveGroupMembership(member: GroupMember | null, groupId?: GroupId): GroupMembership | null {
  if (member === null) {
    return null
  }

  return findActiveGroupMembershipIn(member.groupMemberships, groupId)
}

export function findLatestGroupMembershipIn(
  groupMemberships: GroupMembership[],
  groupId?: GroupId
): GroupMembership | null {
  return (
    groupMemberships
      .filter((m) => groupId == null || m.groupId === groupId)
      .toSorted((a, b) => compareDesc(a.start, b.start))
      .at(0) ?? null
  )
}

export function findLatestGroupMembership(member: GroupMember | null, groupId?: GroupId): GroupMembership | null {
  if (member === null) {
    return null
  }

  return findLatestGroupMembershipIn(member.groupMemberships, groupId)
}

export const areGroupRolesEqual = (rolesA: GroupMembership["roles"], rolesB: GroupMembership["roles"]): boolean => {
  const typesA = new Set(rolesA.map((role) => role.id))
  const typesB = new Set(rolesB.map((role) => role.id))

  return typesA.symmetricDifference(typesB).size === 0
}

// Following an interest group creates a membership with no roles.
// Only allow ending those memberships.
export function canEndInterestGroupMembership(membership: GroupMembership): boolean {
  return membership.roles.length === 0
}

export function getActiveMembershipsForGroup(memberships: GroupMembership[], groupId: string): GroupMembership[] {
  return memberships.filter((membership) => membership.groupId === groupId && isGroupMembershipActive(membership))
}

export function canEndInterestGroupMemberships(memberships: GroupMembership[], interestGroupId: string): boolean {
  return getActiveMembershipsForGroup(memberships, interestGroupId).every(canEndInterestGroupMembership)
}

export function hasGroupMembershipRoleType(membership: GroupMembership, type: GroupRoleType): boolean {
  return membership.roles.some((role) => role.type === type)
}

export function isEmailOnlyGroupMembership(membership: GroupMembership): boolean {
  return membership.roles.every((role) => role.type === GroupRoleTypeEnum.EMAIL_ONLY)
}

export function isGroupMemberVisible(
  member: GroupMember,
  visibility: GroupMemberVisibilityType,
  viewerUserId?: string | null
): boolean {
  const membership = findActiveGroupMembership(member)
  const isMe = member.id === viewerUserId
  const isEmailOnly = membership != null && isEmailOnlyGroupMembership(membership)

  if (visibility === "NONE" || (isEmailOnly && !isMe)) {
    return false
  }

  if (visibility === "ALL_MEMBERS") {
    return true
  }

  if (visibility === "LEADER") {
    return membership !== null && hasGroupMembershipRoleType(membership, GroupRoleTypeEnum.LEADER)
  }

  if (visibility === "WITH_ROLES") {
    return (
      membership?.roles.some(
        (role) => role.type !== GroupRoleTypeEnum.COSMETIC && role.type !== GroupRoleTypeEnum.EMAIL_ONLY
      ) ?? false
    )
  }

  return false
}

export function getGroupRolePriority(role: GroupRole): number {
  switch (role.type) {
    case GroupRoleTypeEnum.LEADER:
      return 8
    case GroupRoleTypeEnum.DEPUTY_LEADER:
      return 7
    case GroupRoleTypeEnum.TREASURER:
      return 6
    case GroupRoleTypeEnum.TRUSTEE:
      return 5
    case GroupRoleTypeEnum.PUNISHER:
      return 4
    case GroupRoleTypeEnum.COSMETIC:
      return 3
    case GroupRoleTypeEnum.EMAIL_ONLY:
      return 2
    case GroupRoleTypeEnum.TEMPORARILY_LEAVE:
      return 1
  }
}

export function sortGroupRolesByPriority(roles: GroupRole[]): GroupRole[] {
  return roles.toSorted((a, b) => getGroupRolePriority(b) - getGroupRolePriority(a))
}

export function getHighestGroupRolePriority(roles: GroupRole[]): number {
  if (roles.length === 0) {
    return 0
  }

  return Math.max(...roles.map(getGroupRolePriority))
}

export const GROUP_IMAGE_MAX_SIZE_KIB = 5 * 1024

export const isCurrentUserMemberOfInterestGroup = (
  currentUserInterestGroups: Group[],
  interestGroupId: string
): boolean => {
  return currentUserInterestGroups.some((currentUserInterestGroup) => currentUserInterestGroup.slug === interestGroupId)
}
