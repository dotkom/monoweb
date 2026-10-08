"use client"

import { Title } from "@dotkomonline/ui"
import { useMemo } from "react"
import { COMMITTEES, useCommitteeAvailabilities } from "../committees"
import { type CommitteeStatusRow, CommitteeStatusTable } from "./CommitteeStatusTable"

export default function ApplicationStatusPage() {
  const { availabilities } = useCommitteeAvailabilities()

  const rows = useMemo<CommitteeStatusRow[]>(
    () => COMMITTEES.map((committee) => ({ ...committee, availability: availabilities[committee.slug] })),
    [availabilities]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Title element="h2" className="text-2xl">
          Status
        </Title>
      </div>

      <CommitteeStatusTable rows={rows} />
    </div>
  )
}
