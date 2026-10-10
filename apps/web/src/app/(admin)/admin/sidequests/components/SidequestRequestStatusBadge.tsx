import {
  SidequestStatusSchema,
  type SidequestStatus,
  mapSidequestStatusToRequestStatusLabel,
} from "@dotkomonline/rpc/sidequest"
import { Badge } from "@dotkomonline/ui"

export const SidequestRequestStatusBadge = ({ status }: { status: SidequestStatus }) => {
  const statusLabel = mapSidequestStatusToRequestStatusLabel(status)
  const color =
    status === SidequestStatusSchema.enum.PUBLISHED
      ? "green"
      : status === SidequestStatusSchema.enum.REJECTED
        ? "red"
        : "amber"

  return <Badge color={color}>{statusLabel}</Badge>
}
