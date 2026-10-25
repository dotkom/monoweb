import { useAuthorization } from "@admin/auth/authorization-context"
import { canEditEvent } from "@dotkomonline/rpc/event-permissions"
import { useMemo } from "react"
import { useEventContext } from "./[id]/provider"

export function useEventEditPermission() {
  const { event } = useEventContext()
  const authorization = useAuthorization()

  const hostingGroupIds = useMemo(() => event.hostingGroups.map((group) => group.slug), [event.hostingGroups])
  const canEdit = canEditEvent(authorization, hostingGroupIds, hostingGroupIds)

  return { canEdit }
}
