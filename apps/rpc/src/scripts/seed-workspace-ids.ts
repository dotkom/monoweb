import { configuration } from "src/configuration"
import { createServiceLayer, createThirdPartyClients } from "src/modules/core"
import { WorkspaceDirectoryNotAvailableError } from "src/modules/workspace-sync/workspace-error"

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

const groups = await serviceLayer.groupService.getAll(prisma)

const groupsToIgnore = ["itex"]
const relevantGroups = groups.filter(
  (g) => (g.type === "COMMITTEE" || g.type === "NODE_COMMITTEE") && !groupsToIgnore.includes(g.slug)
)

const workspaceService = serviceLayer.workspaceService
if (!workspaceService) {
  throw new WorkspaceDirectoryNotAvailableError()
}

console.log("Syncing groups")
for (const group of relevantGroups) {
  const workspaceGroup = await workspaceService.findWorkspaceGroup(prisma, group.slug)
  if (!workspaceGroup) {
    continue
  }

  console.log(`Syncing group ${group.slug} with workspaceId ${workspaceGroup.id}`)

  await serviceLayer.groupService.update(prisma, group.slug, {
    workspaceGroupId: workspaceGroup.id,
  })
}

console.log("Syncing users")
for (const group of relevantGroups) {
  const userIds = new Set<string>()
  const members = await serviceLayer.groupService.getMembers(prisma, group.slug)

  for (const user of members.values()) {
    if (userIds.has(user.id)) {
      continue
    }

    userIds.add(user.id)

    const workspaceUser = await workspaceService.getWorkspaceUser(prisma, user.id).catch(() => null)
    if (workspaceUser === null) {
      console.log(`User ${user.id} ${user.name} was not found in workspace`)
      continue
    }

    console.log(`Syncing user ${user.id} ${user.name} with workspaceId ${workspaceUser.id}`)

    await serviceLayer.userService.update(prisma, user.id, { workspaceUserId: workspaceUser.id }).catch(() => {
      console.log(`Failed to update workspace id: ${user.id} ${user.name} ${workspaceUser.id}`)
    })
  }
}
