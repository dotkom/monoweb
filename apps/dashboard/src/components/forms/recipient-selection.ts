export type RecipientMember = {
  userId: string
  name: string | null
}

export type DirectRecipientSource = {
  kind: "direct"
  id: string
  member: RecipientMember
}

export type GroupRecipientSource = {
  kind: "group"
  id: string
  groupSlug: string
  groupLabel: string
  members: RecipientMember[]
}

export type EventRecipientSource = {
  kind: "event"
  id: string
  eventId: string
  eventTitle: string
  members: RecipientMember[]
}

export type RecipientSource = DirectRecipientSource | GroupRecipientSource | EventRecipientSource

export type RecipientSelection = RecipientSource[]

function createSourceId(): string {
  return crypto.randomUUID()
}

export function flattenRecipientIds(selection: RecipientSelection): string[] {
  const userIds = new Set<string>()

  for (const source of selection) {
    if (source.kind === "direct") {
      userIds.add(source.member.userId)
      continue
    }

    for (const member of source.members) {
      userIds.add(member.userId)
    }
  }

  return [...userIds]
}

export function selectionFromFlatIds(userIds: string[]): RecipientSelection {
  return userIds.map((userId) => ({
    kind: "direct" as const,
    id: createSourceId(),
    member: { userId, name: null },
  }))
}

export function appendDirectMember(selection: RecipientSelection, member: RecipientMember): RecipientSelection {
  const hasDirectEntry = selection.some(
    (source) => source.kind === "direct" && source.member.userId === member.userId
  )

  if (hasDirectEntry) {
    return selection
  }

  return [
    ...selection,
    {
      kind: "direct",
      id: createSourceId(),
      member,
    },
  ]
}

export function appendGroupMembers(
  selection: RecipientSelection,
  groupSlug: string,
  groupLabel: string,
  members: RecipientMember[]
): RecipientSelection {
  if (members.length === 0) {
    return selection
  }

  const existingGroupSource = selection.find(
    (source) => source.kind === "group" && source.groupSlug === groupSlug
  )

  if (existingGroupSource?.kind === "group") {
    const existingUserIds = new Set(existingGroupSource.members.map((member) => member.userId))
    const mergedMembers = [...existingGroupSource.members]

    for (const member of members) {
      if (existingUserIds.has(member.userId)) {
        continue
      }

      mergedMembers.push(member)
      existingUserIds.add(member.userId)
    }

    return selection.map((source) => {
      if (source.id !== existingGroupSource.id) {
        return source
      }

      return {
        ...existingGroupSource,
        members: mergedMembers,
      }
    })
  }

  return [
    ...selection,
    {
      kind: "group",
      id: createSourceId(),
      groupSlug,
      groupLabel,
      members,
    },
  ]
}

export function appendEventMembers(
  selection: RecipientSelection,
  eventId: string,
  eventTitle: string,
  members: RecipientMember[]
): RecipientSelection {
  if (members.length === 0) {
    return selection
  }

  const existingEventSource = selection.find((source) => source.kind === "event" && source.eventId === eventId)

  if (existingEventSource?.kind === "event") {
    const existingUserIds = new Set(existingEventSource.members.map((member) => member.userId))
    const mergedMembers = [...existingEventSource.members]

    for (const member of members) {
      if (existingUserIds.has(member.userId)) {
        continue
      }

      mergedMembers.push(member)
      existingUserIds.add(member.userId)
    }

    return selection.map((source) => {
      if (source.id !== existingEventSource.id) {
        return source
      }

      return {
        ...existingEventSource,
        members: mergedMembers,
      }
    })
  }

  return [
    ...selection,
    {
      kind: "event",
      id: createSourceId(),
      eventId,
      eventTitle,
      members,
    },
  ]
}

export function removeMemberFromSource(
  selection: RecipientSelection,
  sourceId: string,
  userId: string
): RecipientSelection {
  return selection
    .map((source) => {
      if (source.id !== sourceId) {
        return source
      }

      if (source.kind === "direct") {
        if (source.member.userId !== userId) {
          return source
        }

        return null
      }

      const members = source.members.filter((member) => member.userId !== userId)

      if (members.length === 0) {
        return null
      }

      return {
        ...source,
        members,
      }
    })
    .filter((source): source is RecipientSource => source !== null)
}

export function removeSource(selection: RecipientSelection, sourceId: string): RecipientSelection {
  return selection.filter((source) => source.id !== sourceId)
}

export function getOtherSourceLabels(
  selection: RecipientSelection,
  userId: string,
  excludeSourceId: string
): string[] {
  const labels: string[] = []

  for (const source of selection) {
    if (source.id === excludeSourceId) {
      continue
    }

    if (source.kind === "direct" && source.member.userId === userId) {
      labels.push("Enkeltvalg")
      continue
    }

    if (source.kind === "group" && source.members.some((member) => member.userId === userId)) {
      labels.push(source.groupLabel)
      continue
    }

    if (source.kind === "event" && source.members.some((member) => member.userId === userId)) {
      labels.push(source.eventTitle)
    }
  }

  return labels
}

export function getRecipientPreview(selection: RecipientSelection, previewLimit = 3): {
  count: number
  previewNames: string[]
  remainingCount: number
} {
  const count = flattenRecipientIds(selection).length
  const nameByUserId = new Map<string, string>()

  for (const source of selection) {
    const members = source.kind === "direct" ? [source.member] : source.members

    for (const member of members) {
      if (nameByUserId.has(member.userId)) {
        continue
      }

      nameByUserId.set(member.userId, member.name ?? member.userId)
    }
  }

  const previewNames = [...nameByUserId.values()].slice(0, previewLimit)
  const remainingCount = Math.max(0, count - previewNames.length)

  return { count, previewNames, remainingCount }
}

export function arrayEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false
  }

  const sortedLeft = [...left].sort()
  const sortedRight = [...right].sort()

  return sortedLeft.every((value, index) => value === sortedRight[index])
}
