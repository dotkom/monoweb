import { useAuthorization } from "@admin/auth/authorization-context"
import { canEditEvent } from "@dotkomonline/rpc/event-permissions"
import type { GroupId } from "@dotkomonline/rpc/group"
import { useCallback } from "react"

export function useCanEditByGroups() {
  const principal = useAuthorization()

  return useCallback((groupIds: readonly GroupId[]) => canEditEvent(principal, groupIds), [principal])
}
