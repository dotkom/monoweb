"use client"

import { DialogClose, Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useUpdatePoolMutation } from "../../../mutations"
import { useAttendanceGetQuery } from "../../../queries"
import { PoolForm, type PoolFormValues } from "./PoolForm"

interface EditPoolModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poolId: string
  attendanceId: string
  defaultValues: PoolFormValues
}

export function EditPoolModal({ open, onOpenChange, attendanceId, poolId, defaultValues }: EditPoolModalProps) {
  const { data: attendance } = useAttendanceGetQuery(attendanceId, open)
  const { mutate: updatePool } = useUpdatePoolMutation()

  const disabledYears = attendance
    ? [...new Set(attendance.pools.filter((pool) => pool.id !== poolId).flatMap(({ yearCriteria }) => yearCriteria))]
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader className="flex-row items-center justify-between gap-4">
          <DialogTitle>Endre påmeldingsgruppe</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>

        <DialogBody>
          {open && attendance && (
            <PoolForm
              defaultValues={{
                yearCriteria: defaultValues.yearCriteria,
                capacity: defaultValues.capacity,
                title: defaultValues.title,
                mergeDelayHours: defaultValues.mergeDelayHours,
              }}
              onClose={() => onOpenChange(false)}
              onSubmit={(values: PoolFormValues) => {
                updatePool({
                  input: {
                    capacity: values.capacity,
                    title: values.title,
                    yearCriteria: values.yearCriteria,
                    mergeDelayHours: values.mergeDelayHours,
                  },
                  id: poolId,
                  fillAddedSeats: values.fillAddedSeats,
                })
                onOpenChange(false)
              }}
              disabledYears={disabledYears}
              mode="update"
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
