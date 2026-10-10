import {
  type InterestGroupEventStatus,
  mapInterestGroupEventStatusToRequestStatusLabel,
} from "@dotkomonline/rpc/interest-group-event"
import { Badge } from "@dotkomonline/ui"

export const InterestGroupEventRequestStatusBadge = ({ status }: { status: InterestGroupEventStatus }) => {
  const statusLabel = mapInterestGroupEventStatusToRequestStatusLabel(status)
  const color = status === "PUBLISHED" ? "green" : status === "REJECTED" ? "red" : "amber"

  return <Badge color={color}>{statusLabel}</Badge>
}
