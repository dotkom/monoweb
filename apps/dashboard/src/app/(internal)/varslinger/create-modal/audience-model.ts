export type AudienceMember = {
  userId: string
  name: string | null
}

export type PeopleAudienceRule = {
  kind: "people"
  id: string
  members: AudienceMember[]
}

export type GroupAudienceMember = AudienceMember & {
  isActive: boolean
}

export type GroupAudienceRule = {
  kind: "group"
  id: string
  groupSlug: string
  groupLabel: string
  includeActive: boolean
  includeInactive: boolean
  members: GroupAudienceMember[]
}

export type EventAudienceMember = AudienceMember & {
  reserved: boolean
}

export type EventAudienceRule = {
  kind: "event"
  id: string
  eventId: string
  eventTitle: string
  includeReserved: boolean
  includeUnreserved: boolean
  members: EventAudienceMember[]
}

export type AudienceRule = PeopleAudienceRule | GroupAudienceRule | EventAudienceRule

export type AudienceState = {
  rules: AudienceRule[]
  excludedUserIds: string[]
  excludedMembers: AudienceMember[]
}

export type ResolvedRecipient = {
  userId: string
  name: string | null
  sourceLabels: string[]
}

export type AudienceResolution = {
  recipients: ResolvedRecipient[]
  uniqueCount: number
  matchCount: number
  duplicateCount: number
}

function createRuleId(): string {
  return crypto.randomUUID()
}

export function createEmptyAudience(): AudienceState {
  return {
    rules: [],
    excludedUserIds: [],
    excludedMembers: [],
  }
}

export function getMembersForRule(rule: AudienceRule): AudienceMember[] {
  if (rule.kind === "people") {
    return rule.members
  }

  if (rule.kind === "group") {
    return rule.members.filter((member) => {
      if (member.isActive && rule.includeActive) {
        return true
      }

      if (!member.isActive && rule.includeInactive) {
        return true
      }

      return false
    })
  }

  return rule.members.filter((member) => {
    if (member.reserved && rule.includeReserved) {
      return true
    }

    if (!member.reserved && rule.includeUnreserved) {
      return true
    }

    return false
  })
}

export function getRuleTitle(rule: AudienceRule): string {
  if (rule.kind === "people") {
    return "Enkeltpersoner"
  }

  if (rule.kind === "group") {
    return "Gruppemedlemmer"
  }

  return "Påmeldte til arrangement"
}

export function getRuleSubtitle(rule: AudienceRule): string {
  if (rule.kind === "people") {
    return rule.members.map((member) => member.name ?? member.userId).join(", ")
  }

  if (rule.kind === "group") {
    return rule.groupLabel
  }

  return rule.eventTitle
}

export function getRuleSegmentSummary(rule: AudienceRule): string | null {
  if (rule.kind === "people") {
    return null
  }

  if (rule.kind === "group") {
    const segments: string[] = []

    if (rule.includeActive) {
      segments.push("Aktive medlemmer")
    }

    if (rule.includeInactive) {
      segments.push("Inaktive medlemmer")
    }

    return segments.length > 0 ? `Inkludert: ${segments.join(", ")}` : "Ingen segmenter valgt"
  }

  const segments: string[] = []

  if (rule.includeReserved) {
    segments.push("Påmeldte med plass")
  }

  if (rule.includeUnreserved) {
    segments.push("Påmeldte uten plass")
  }

  return segments.length > 0 ? `Inkludert: ${segments.join(", ")}` : "Ingen segmenter valgt"
}

export function getRuleLabel(rule: AudienceRule): string {
  if (rule.kind === "people") {
    return "Enkeltpersoner"
  }

  if (rule.kind === "group") {
    return rule.groupLabel
  }

  return rule.eventTitle
}

export function resolveAudience(audience: AudienceState): AudienceResolution {
  const excludedSet = new Set(audience.excludedUserIds)
  const sourceLabelsByUserId = new Map<string, string[]>()
  const nameByUserId = new Map<string, string | null>()
  const allMatchedUserIds = new Set<string>()
  let matchCount = 0

  for (const rule of audience.rules) {
    const members = getMembersForRule(rule)
    const ruleLabel = getRuleLabel(rule)

    for (const member of members) {
      matchCount += 1
      allMatchedUserIds.add(member.userId)

      if (excludedSet.has(member.userId)) {
        continue
      }

      const existingLabels = sourceLabelsByUserId.get(member.userId) ?? []

      if (!existingLabels.includes(ruleLabel)) {
        existingLabels.push(ruleLabel)
      }

      sourceLabelsByUserId.set(member.userId, existingLabels)

      if (!nameByUserId.has(member.userId)) {
        nameByUserId.set(member.userId, member.name)
      }
    }
  }

  const recipients: ResolvedRecipient[] = [...sourceLabelsByUserId.entries()].map(([userId, sourceLabels]) => ({
    userId,
    name: nameByUserId.get(userId) ?? null,
    sourceLabels,
  }))

  const uniqueCount = recipients.length
  const duplicateCount = Math.max(0, matchCount - allMatchedUserIds.size)

  return {
    recipients,
    uniqueCount,
    matchCount,
    duplicateCount,
  }
}

export function flattenAudienceRecipientIds(audience: AudienceState): string[] {
  return resolveAudience(audience).recipients.map((recipient) => recipient.userId)
}

export function createPeopleRule(members: AudienceMember[]): PeopleAudienceRule {
  return {
    kind: "people",
    id: createRuleId(),
    members,
  }
}

export function createGroupRule(input: {
  groupSlug: string
  groupLabel: string
  members: GroupAudienceMember[]
  includeActive?: boolean
  includeInactive?: boolean
}): GroupAudienceRule {
  return {
    kind: "group",
    id: createRuleId(),
    groupSlug: input.groupSlug,
    groupLabel: input.groupLabel,
    includeActive: input.includeActive ?? true,
    includeInactive: input.includeInactive ?? false,
    members: input.members,
  }
}

export function createEventRule(input: {
  eventId: string
  eventTitle: string
  members: EventAudienceMember[]
  includeReserved?: boolean
  includeUnreserved?: boolean
}): EventAudienceRule {
  return {
    kind: "event",
    id: createRuleId(),
    eventId: input.eventId,
    eventTitle: input.eventTitle,
    includeReserved: input.includeReserved ?? true,
    includeUnreserved: input.includeUnreserved ?? true,
    members: input.members,
  }
}

export function upsertPeopleRule(audience: AudienceState, members: AudienceMember[]): AudienceState {
  const existingPeopleRule = audience.rules.find((rule) => rule.kind === "people")

  if (existingPeopleRule?.kind !== "people") {
    return {
      ...audience,
      rules: [...audience.rules, createPeopleRule(members)],
    }
  }

  const existingUserIds = new Set(existingPeopleRule.members.map((member) => member.userId))
  const mergedMembers = [...existingPeopleRule.members]

  for (const member of members) {
    if (existingUserIds.has(member.userId)) {
      continue
    }

    mergedMembers.push(member)
    existingUserIds.add(member.userId)
  }

  return {
    ...audience,
    rules: audience.rules.map((rule) => {
      if (rule.id !== existingPeopleRule.id) {
        return rule
      }

      return {
        ...existingPeopleRule,
        members: mergedMembers,
      }
    }),
  }
}

export function upsertGroupRule(
  audience: AudienceState,
  input: {
    groupSlug: string
    groupLabel: string
    members: GroupAudienceMember[]
    includeActive?: boolean
    includeInactive?: boolean
  }
): AudienceState {
  const existingGroupRule = audience.rules.find(
    (rule) => rule.kind === "group" && rule.groupSlug === input.groupSlug
  )

  if (existingGroupRule?.kind !== "group") {
    return {
      ...audience,
      rules: [...audience.rules, createGroupRule(input)],
    }
  }

  return {
    ...audience,
    rules: audience.rules.map((rule) => {
      if (rule.id !== existingGroupRule.id) {
        return rule
      }

      return {
        ...existingGroupRule,
        groupLabel: input.groupLabel,
        includeActive: input.includeActive ?? existingGroupRule.includeActive,
        includeInactive: input.includeInactive ?? existingGroupRule.includeInactive,
        members: input.members,
      }
    }),
  }
}

export function upsertEventRule(
  audience: AudienceState,
  input: {
    eventId: string
    eventTitle: string
    members: EventAudienceMember[]
    includeReserved?: boolean
    includeUnreserved?: boolean
  }
): AudienceState {
  const existingEventRule = audience.rules.find((rule) => rule.kind === "event" && rule.eventId === input.eventId)

  if (existingEventRule?.kind !== "event") {
    return {
      ...audience,
      rules: [...audience.rules, createEventRule(input)],
    }
  }

  return {
    ...audience,
    rules: audience.rules.map((rule) => {
      if (rule.id !== existingEventRule.id) {
        return rule
      }

      return {
        ...existingEventRule,
        eventTitle: input.eventTitle,
        includeReserved: input.includeReserved ?? existingEventRule.includeReserved,
        includeUnreserved: input.includeUnreserved ?? existingEventRule.includeUnreserved,
        members: input.members,
      }
    }),
  }
}

export function updateAudienceRule(audience: AudienceState, nextRule: AudienceRule): AudienceState {
  return {
    ...audience,
    rules: audience.rules.map((rule) => {
      if (rule.id !== nextRule.id) {
        return rule
      }

      return nextRule
    }),
  }
}

export function removeAudienceRule(audience: AudienceState, ruleId: string): AudienceState {
  return {
    ...audience,
    rules: audience.rules.filter((rule) => rule.id !== ruleId),
  }
}

export function excludeRecipient(audience: AudienceState, member: AudienceMember): AudienceState {
  if (audience.excludedUserIds.includes(member.userId)) {
    return audience
  }

  return {
    ...audience,
    excludedUserIds: [...audience.excludedUserIds, member.userId],
    excludedMembers: [...audience.excludedMembers, member],
  }
}

export function removeExclusion(audience: AudienceState, userId: string): AudienceState {
  return {
    ...audience,
    excludedUserIds: audience.excludedUserIds.filter((excludedUserId) => excludedUserId !== userId),
    excludedMembers: audience.excludedMembers.filter((member) => member.userId !== userId),
  }
}

export function summarizeAudienceRules(audience: AudienceState): string {
  if (audience.rules.length === 0) {
    return "Ingen mottakere valgt"
  }

  const parts = audience.rules.map((rule) => {
    if (rule.kind === "people") {
      const count = getMembersForRule(rule).length
      return count === 1 ? "1 enkeltperson" : `${count} enkeltpersoner`
    }

    if (rule.kind === "group") {
      const segments: string[] = []

      if (rule.includeActive) {
        segments.push("aktive")
      }

      if (rule.includeInactive) {
        segments.push("inaktive")
      }

      const segmentText = segments.length > 0 ? segments.join(" og ") : "ingen"
      return `${segmentText} ${rule.groupLabel}-medlemmer`
    }

    return `påmeldte til ${rule.eventTitle}`
  })

  return parts.join(", ")
}
