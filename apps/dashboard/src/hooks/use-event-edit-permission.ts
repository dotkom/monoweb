import { useAuthorization } from "@/auth/authorization-context"
import { useMemo } from "react"
import { useEventContext } from "../app/(internal)/arrangementer/[id]/provider"

export function useEventEditPermission() {
  const { event } = useEventContext()
  const { canEditEvent } = useAuthorization()

  const hostingGroupIds = useMemo(() => event.hostingGroups.map((group) => group.slug), [event.hostingGroups])
  const canEdit = canEditEvent(hostingGroupIds)

  return { canEdit, hostingGroupIds }
}
