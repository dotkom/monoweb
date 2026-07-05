import { useUserDetailsContext } from "@/app/(internal)/brukere/[id]/provider"
import { useAuthorization } from "@/auth/authorization-context"
import { useUser } from "@auth0/nextjs-auth0/client"

export function useUserEditPermission() {
  const { user } = useUserDetailsContext()
  const { user: sessionUser } = useUser()
  const { canEditUserProfile } = useAuthorization()

  const canEdit = canEditUserProfile(user.id, sessionUser?.sub ?? null)

  return { canEdit }
}
