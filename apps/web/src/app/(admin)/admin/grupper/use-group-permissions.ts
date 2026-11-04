import { useAuthorization } from "@admin/auth/authorization-context"
import { useGroupDetailsContext } from "@admin/grupper/[id]/provider"
import {
  canDeleteGroup,
  canManageGroupMembership,
  canManageGroupRoles,
  canUpdateGroup,
} from "@dotkomonline/rpc/group-permissions"

export function useGroupPermissions() {
  const { group } = useGroupDetailsContext()
  const authorization = useAuthorization()

  const canUpdate = canUpdateGroup(authorization, group.slug, group.type)
  const canDelete = canDeleteGroup(authorization, group.type)
  const canManageMembership = canManageGroupMembership(authorization, group.slug, group.type)
  const canManageRoles = canManageGroupRoles(authorization, group.slug, group.type)

  return {
    canUpdate,
    canDelete,
    canManageMembership,
    canManageRoles,
    canEdit: canUpdate || canManageMembership || canManageRoles,
  }
}
