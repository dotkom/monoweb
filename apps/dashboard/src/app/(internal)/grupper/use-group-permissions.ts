import { useAuthorization } from "@/auth/authorization-context"
import { useGroupDetailsContext } from "@/app/(internal)/grupper/[id]/provider"

export function useGroupPermissions() {
  const { group } = useGroupDetailsContext()
  const authorization = useAuthorization()
  const isInterestGroup = group.type === "INTEREST_GROUP"

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
