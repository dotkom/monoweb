import { useAuthorization } from "@/auth/authorization-context"
import { useContestContext } from "@/app/(internal)/konkurranser/[id]/provider"

export function useContestEditPermission() {
  const { contest } = useContestContext()
  const { canEditContest } = useAuthorization()

  return canEditContest(contest.groups)
}
