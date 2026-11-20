import { REQUIRED_ATTENDEES } from "../../../../components/Calendar/slot-layout"
import { EmptyCell, NumberCell } from "../../../../components/Cells"
import type {
  CommitteeApplicationGroupMatching,
  CommitteeApplicationMatchedInterview,
} from "@dotkomonline/rpc/committee-application"
import type { UserId } from "@dotkomonline/rpc/user"
import { Badge, type BadgeColor } from "@dotkomonline/ui"
import { createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper<CommitteeApplicationGroupMatching>()

const countInterviews = (
  matching: CommitteeApplicationGroupMatching,
  predicate: (interview: CommitteeApplicationMatchedInterview) => boolean
) => matching.matchedInterviews.filter(predicate).length

const CountBadge = ({
  count,
  isProblem = false,
  color = "green",
}: {
  count: number
  isProblem?: boolean
  color?: BadgeColor
}) => (
  <Badge color={isProblem && count > 0 ? "red" : color} variant="default" className="gap-1 tabular-nums">
    {isProblem && count === 0 ? "Ingen" : count}
  </Badge>
)

const unmatchedColumn = columnHelper.accessor((row) => row.unmatchedApplicants.length, {
  id: "unmatched",
  header: () => "Uten intervju",
  cell: (info) => <CountBadge count={info.getValue()} isProblem />,
})

export const createInterviewColumns = (userId: UserId | null) => {
  if (userId === null) {
    return [
      columnHelper.accessor((row) => row.matchedInterviews.length, {
        id: "interviews",
        header: () => "Intervjuer",
        cell: (info) =>
          info.getValue() === 0 ? <EmptyCell>Ingen</EmptyCell> : <NumberCell>{info.getValue()}</NumberCell>,
      }),
      unmatchedColumn,
    ]
  }

  return [
    columnHelper.accessor(
      (row) => countInterviews(row, (interview) => interview.attendees.some((attendee) => attendee.userId === userId)),
      {
        id: "own",
        header: () => "Dine intervjuer",
        cell: (info) => <CountBadge count={info.getValue()} color="blue" />,
      }
    ),
    columnHelper.accessor(
      (row) => countInterviews(row, (interview) => interview.attendees.length < REQUIRED_ATTENDEES),
      {
        id: "understaffed",
        header: () => "Intervjuer som mangler deltagere",
        cell: (info) => <CountBadge count={info.getValue()} isProblem />,
      }
    ),
    unmatchedColumn,
  ]
}

export const interviewTable = {
  getRowId: (matching: CommitteeApplicationGroupMatching) => matching.applicationGroupId,
  getGroupId: (matching: CommitteeApplicationGroupMatching) => matching.groupId,
}

export function getInterviewHref(applicationPeriodId: string) {
  return (matching: CommitteeApplicationGroupMatching) =>
    `/admin/opptak/${applicationPeriodId}/intervjuer/${matching.applicationGroupId}`
}
