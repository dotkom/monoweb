import { useAuthorization } from "@dashboard/auth/authorization-context"
import { useContestContext } from "@dashboard/app/konkurranser/[id]/provider"

export function useContestEditPermission() {
  const { contest } = useContestContext()
  const { canEditContest } = useAuthorization()

  return canEditContest(contest.groups)
}
