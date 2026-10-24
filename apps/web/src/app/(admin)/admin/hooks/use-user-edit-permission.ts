import { useUserDetailsContext } from "@admin/brukere/[id]/provider"
import { useAuthorization } from "@admin/auth/authorization-context"

export function useUserEditPermission() {
  const { user } = useUserDetailsContext()
  const { canEditUserProfile } = useAuthorization()

  return { canEdit: canEditUserProfile(user.id) }
}
