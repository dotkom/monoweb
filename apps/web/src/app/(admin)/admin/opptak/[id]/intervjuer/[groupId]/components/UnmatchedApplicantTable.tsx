import { AvailabilityIntervals, TextCell } from "../../../../components/Cells"
import type { CommitteeApplicationUnmatchedApplicant } from "@dotkomonline/rpc/committee-application"
import { Text } from "@dotkomonline/ui"
import { createColumnHelper } from "@tanstack/react-table"

const columnHelper = createColumnHelper<CommitteeApplicationUnmatchedApplicant>()

export const unmatchedApplicantTable = {
  getRowId: (applicant: CommitteeApplicationUnmatchedApplicant) => applicant.applicationId,
  columns: [
    columnHelper.accessor("name", {
      header: () => "Søker",
      cell: (info) => <Text className="text-sm">{info.getValue()}</Text>,
    }),
    columnHelper.accessor("email", {
      header: () => "E-post",
      cell: (info) => <TextCell value={info.getValue()} emptyLabel="Ingen e-post" />,
    }),
    columnHelper.accessor("phone", {
      header: () => "Telefon",
      cell: (info) => <TextCell value={info.getValue()} emptyLabel="Ingen telefonnummer" />,
    }),
    columnHelper.accessor((applicant) => applicant.availability.length, {
      id: "availability",
      header: () => "Oppsatte tider",
      cell: (info) => <AvailabilityIntervals availability={info.row.original.availability} />,
    }),
  ],
}
