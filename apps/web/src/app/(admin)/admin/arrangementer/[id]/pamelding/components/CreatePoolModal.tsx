"use client"

import type { Attendance } from "@dotkomonline/rpc/attendance"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@dotkomonline/ui"
import { createPoolName } from "@dotkomonline/utils"
import { IconX } from "@tabler/icons-react"
import { useCreatePoolMutation } from "../../../mutations"
import { getAvailablePoolYears, PoolForm, type PoolFormValues } from "./PoolForm"
import { useMemo } from "react"

type CreatePoolModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: Attendance
}

export function CreatePoolModal({ open, onOpenChange, attendance }: CreatePoolModalProps) {
  const createPool = useCreatePoolMutation()

  const disabledYears = attendance.pools.flatMap((pool) => pool.yearCriteria)
  const availableYears = getAvailablePoolYears(disabledYears)
  const hasAvailableYears = availableYears.length > 0

  const defaultValues = useMemo(() => {
    return {
      yearCriteria: availableYears,
      capacity: 10,
      title: createPoolName(availableYears),
      mergeDelayHours: null,
    }
  }, [availableYears])

  const handleSubmit = (values: PoolFormValues) => {
    createPool.mutate(
      {
        id: attendance.id,
        input: {
          capacity: values.capacity,
          yearCriteria: values.yearCriteria,
          title: values.title,
          mergeDelayHours: values.mergeDelayHours,
        },
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>Ny påmeldingsgruppe</DialogTitle>
            <DialogClose type="button" aria-label="Lukk">
              <IconX className="size-5" />
            </DialogClose>
          </div>
        </DialogHeader>

        <DialogBody>
          {open && hasAvailableYears && (
            <PoolForm
              defaultValues={defaultValues}
              onClose={() => onOpenChange(false)}
              mode="create"
              isPending={createPool.isPending}
              onSubmit={(values) => handleSubmit(values)}
              disabledYears={disabledYears}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
