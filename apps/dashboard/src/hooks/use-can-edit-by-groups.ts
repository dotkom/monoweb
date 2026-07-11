import { useAuthorization } from "@/auth/authorization-context"
import type { GroupId } from "@dotkomonline/rpc/group"
import { useCallback } from "react"

export function useCanEditByGroups() {
  const { canEditEvent } = useAuthorization()

  return useCallback((groupIds: readonly GroupId[]) => canEditEvent(groupIds), [canEditEvent])
}
