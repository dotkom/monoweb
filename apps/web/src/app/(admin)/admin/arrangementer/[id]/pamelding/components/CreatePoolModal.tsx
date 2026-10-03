"use client"

import type { AttendanceId } from "@dotkomonline/rpc/attendance"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useCreatePoolMutation } from "../../../mutations"
import { useAttendanceGetQuery } from "../../../queries"
import { getAvailablePoolYears, PoolForm, type PoolFormValues } from "./PoolForm"

type CreatePoolModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendanceId: AttendanceId
}

export function CreatePoolModal({ open, onOpenChange, attendanceId }: CreatePoolModalProps) {
  const { mutate: createPool } = useCreatePoolMutation()
  const { data: attendance } = useAttendanceGetQuery(attendanceId, open)

  const pools = attendance?.pools
  const disabledYears = pools ? [...new Set(pools.flatMap(({ yearCriteria }) => yearCriteria))] : []

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="lg" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Ny påmeldingsgruppe</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && pools && (
          <PoolForm
            defaultValues={{
              yearCriteria: getAvailablePoolYears(disabledYears),
              capacity: 0,
              title: "",
              mergeDelayHours: null,
            }}
            onClose={() => onOpenChange(false)}
            mode="create"
            onSubmit={(values: PoolFormValues) => {
              createPool({
                id: attendanceId,
                input: {
                  capacity: values.capacity,
                  yearCriteria: values.yearCriteria,
                  title: values.title,
                  mergeDelayHours: values.mergeDelayHours,
                },
              })
              onOpenChange(false)
            }}
            disabledYears={disabledYears}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
