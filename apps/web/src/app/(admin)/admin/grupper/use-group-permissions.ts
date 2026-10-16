import { useAuthorization } from "@admin/auth/authorization-context"
import { useGroupDetailsContext } from "@admin/grupper/[id]/provider"
import { GroupTypeSchema } from "@dotkomonline/rpc/group"

export function useGroupPermissions() {
  const { group } = useGroupDetailsContext()
  const authorization = useAuthorization()
  const isInterestGroup = group.type === GroupTypeSchema.enum.INTEREST_GROUP

  return {
    canUpdate: authorization.canUpdateGroup(group.slug, isInterestGroup),
    canDelete: authorization.canDeleteGroup(group.slug, isInterestGroup),
    canManageMembership: authorization.canManageGroupMembership(group.slug, isInterestGroup),
    canManageRoles: authorization.canManageGroupRoles(group.slug, isInterestGroup),
    canEdit:
      authorization.canUpdateGroup(group.slug, isInterestGroup) ||
      authorization.canManageGroupMembership(group.slug, isInterestGroup) ||
      authorization.canManageGroupRoles(group.slug, isInterestGroup),
  }
}
