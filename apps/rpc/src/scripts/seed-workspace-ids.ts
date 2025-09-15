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

// Sync groups
for (const group of relevantGroups) {
  const workspaceGroup = await workspaceService.findWorkspaceGroup(prisma, group.slug)
  if (!workspaceGroup) {
    continue
  }

  console.log(`${workspaceGroup.id} ${group.slug}`)

  await serviceLayer.groupService.update(prisma, group.slug, {
    workspaceGroupId: workspaceGroup.id,
  })
}

// Sync users
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
      console.log(`${user.id} ${user.name} didn't find workspaceuser`)
      continue
    }

    await serviceLayer.userService.update(prisma, user.id, { workspaceUserId: workspaceUser.id }).catch(() => {
      console.log(`\n\n\Error${user.id} ${user.name} ${workspaceUser.id} \n\n\n`)
    })
  }
}
