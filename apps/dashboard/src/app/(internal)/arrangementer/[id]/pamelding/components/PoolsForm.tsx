"use client"

import { Button } from "@dotkomonline/ui"
import { useState } from "react"
import { CreatePoolModal } from "./CreatePoolModal"

interface EventAttendanceProps {
  attendanceId: string
  disabled?: boolean
}

export function PoolsFormSection({ attendanceId, disabled }: EventAttendanceProps) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="default" className="mt-4" disabled={disabled} onClick={() => setCreateOpen(true)}>
        Opprett ny påmeldingsgruppe
      </Button>
      <CreatePoolModal open={createOpen} onOpenChange={setCreateOpen} attendanceId={attendanceId} />
    </>
  )
}
