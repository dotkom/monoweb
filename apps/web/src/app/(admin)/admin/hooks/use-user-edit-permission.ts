import { useAuthorization } from "@admin/auth/authorization-context"
import { useUserDetailsContext } from "@admin/brukere/[id]/provider"
import { canEditUserProfile } from "@dotkomonline/rpc/user-permissions"

export function useUserEditPermission() {
  const { user } = useUserDetailsContext()
  const authorization = useAuthorization()

  return { canEdit: canEditUserProfile(authorization, user.id) }
}
