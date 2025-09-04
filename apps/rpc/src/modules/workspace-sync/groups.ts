import type { admin_directory_v1 } from "googleapis"
import { getDirectory } from "./client"
import { getKey } from "./helpers"

// This is needed for static type inference, otherwise the TypeScript compiler will explode
// and complain about circular references
type MinimalListReturn<Key extends string, Value> = {
  data: {
    nextPageToken?: string | null
  } & {
    [Prop in Key]?: Value[]
  }
}

export async function insertUserIntoGroup(
  groupName: string,
  userEmail: string
): Promise<admin_directory_v1.Schema$Member | null> {
  const directory = getDirectory()

  if (!directory) {
    return null
  }

  const res = await directory.members
    .insert({
      groupKey: getKey(groupName),
      requestBody: {
        email: getKey(userEmail),
        role: "MEMBER",
      },
    })
    .catch(() => null)

  return res?.data ?? null
}

export async function removeUserFromGroup(groupName: string, userEmail: string): Promise<boolean> {
  const directory = getDirectory()

  if (!directory) {
    return false
  }

  return await directory.members
    .delete({
      groupKey: getKey(groupName),
      memberKey: getKey(userEmail),
    })
    .then(() => true)
    .catch(() => false)
}

export async function getUsersForGroup(groupName: string): Promise<admin_directory_v1.Schema$Member[]> {
  const directory = getDirectory()

  if (!directory) {
    return []
  }

  const members: admin_directory_v1.Schema$Member[] = []

  let pageToken: string | undefined = undefined
  do {
    const { data }: MinimalListReturn<"members", admin_directory_v1.Schema$Member> = await directory.members.list({
      groupKey: getKey(groupName),
      pageToken,
    })

    const pageMembers = data.members ?? []
    members.push(...pageMembers)

    pageToken = data.nextPageToken ?? undefined
  } while (pageToken)

  return members
}

export async function getGroupsForUser(user: string): Promise<admin_directory_v1.Schema$Group[]> {
  const directory = getDirectory()

  if (!directory) {
    return []
  }

  const groups: admin_directory_v1.Schema$Group[] = []

  let pageToken: string | undefined = undefined
  do {
    const { data }: MinimalListReturn<"groups", admin_directory_v1.Schema$Group> = await directory.groups.list({
      userKey: getKey(user),
      pageToken,
    })

    const pageGroups = data.groups ?? []
    groups.push(...pageGroups)

    pageToken = data.nextPageToken ?? undefined
  } while (pageToken)

  return groups
}
