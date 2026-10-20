import { useAuthorization } from "@admin/auth/authorization-context"
import { useContestContext } from "@admin/konkurranser/[id]/provider"
import { canManageContest } from "@dotkomonline/rpc/contest-permissions"

export function useContestManagePermission() {
  const { contest } = useContestContext()
  const authorization = useAuthorization()

  return canManageContest(authorization, contest.groups)
}
