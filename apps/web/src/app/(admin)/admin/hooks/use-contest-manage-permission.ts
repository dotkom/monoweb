import { useAuthorization } from "@admin/auth/authorization-context"
import { useContestContext } from "@admin/konkurranser/[id]/provider"
import { canManageContest, toContestOrganizerGroups } from "@dotkomonline/rpc/contest-permissions"

export function useContestManagePermission() {
  const { contest } = useContestContext()
  const authorization = useAuthorization()

  return canManageContest(authorization, toContestOrganizerGroups(contest.groups, authorization.groups))
}
