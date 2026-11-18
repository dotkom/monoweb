"use client"

import type { Attendance } from "@dotkomonline/rpc/attendance"
import { Button, Text } from "@dotkomonline/ui"
import { useState } from "react"
import { CreatePoolModal } from "./CreatePoolModal"
import { getAvailablePoolYears } from "./PoolForm"

interface EventAttendanceProps {
  attendance: Attendance
  disabled?: boolean
}

export function PoolsFormSection({ attendance, disabled }: EventAttendanceProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const coveredYears = attendance.pools.flatMap((pool) => pool.yearCriteria)
  const hasAvailableYears = getAvailablePoolYears(coveredYears).length > 0

  return (
    <>
      <Button
        variant="default"
        className="mt-4"
        disabled={disabled || !hasAvailableYears}
        aria-describedby={hasAvailableYears ? undefined : "pool-criteria-covered"}
        onClick={() => setCreateOpen(true)}
      >
        Opprett ny påmeldingsgruppe
      </Button>
      {!hasAvailableYears && (
        <Text id="pool-criteria-covered" className="mt-2 text-sm text-muted-foreground">
          Alle klassetrinn er allerede dekket.
        </Text>
      )}
      <CreatePoolModal open={createOpen} onOpenChange={setCreateOpen} attendance={attendance} />
    </>
  )
}
