import { DateCell, DurationCell } from "../../../../components/Cells"
import type { CommitteeApplicationGroupStatus } from "@dotkomonline/rpc/committee-application"
import { Badge } from "@dotkomonline/ui"
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react"
import { createColumnHelper, type SortingState } from "@tanstack/react-table"

const columnHelper = createColumnHelper<CommitteeApplicationGroupStatus>()

const StatusCell = ({ isComplete }: { isComplete: boolean }) => {
  const StatusIcon = isComplete ? IconCheck : IconAlertTriangle

  return (
    <Badge color={isComplete ? "green" : "red"} variant="default" className="gap-1 tabular-nums">
      <StatusIcon className="size-3.5 shrink-0" stroke={2} />
      {isComplete ? "Ferdig" : "Mangler"}
    </Badge>
  )
}

export const availabilityTable = {
  columns: [
    columnHelper.accessor((row) => row.interviewBlockCount > 0 && row.hasAllValidRooms, {
      id: "status",
      header: () => "Status",
      cell: (info) => <StatusCell isComplete={info.getValue()} />,
    }),
    columnHelper.accessor("interviewMinutes", {
      header: () => "Intervjutid",
      cell: (info) => <DurationCell minutes={info.getValue()} />,
    }),
    columnHelper.accessor("interviewBlocksUpdatedAt", {
      header: () => "Sist endret",
      cell: (info) => <DateCell date={info.getValue()} emptyLabel="Aldri" />,
    }),
  ],
  getRowId: (group: CommitteeApplicationGroupStatus) => group.id,
  getGroupId: (group: CommitteeApplicationGroupStatus) => group.groupId,
  getHref: (group: CommitteeApplicationGroupStatus) =>
    `/admin/opptak/${group.applicationPeriodId}/tilgjengelighet/${group.id}`,
  initialSorting: [{ id: "status", desc: false }] satisfies SortingState,
}
