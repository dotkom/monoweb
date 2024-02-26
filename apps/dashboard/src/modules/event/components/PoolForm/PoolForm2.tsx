import { Box, Button } from "@mantine/core"
import { type FC } from "react"
import { z } from "zod"
import { validateAndReturn } from "./utils"
import { createLabelledCheckboxGroupInput, createNumberInput, useFormBuilder } from "../../../../app/form"
import { notifyComplete, notifyFail } from "../../../../app/notifications"
import { trpc } from "../../../../utils/trpc"
import { useEventAttendanceGetQuery } from "../../queries/use-event-attendance-get-query"

interface PoolFormProps {
  attendanceId: string
  defaultValues?: Schema
  update?: boolean
  onClose(): void
}

const Schema = z.object({
  yearCriteria: z.array(z.number()),
  limit: z.number(),
})
type Schema = z.infer<typeof Schema>

export const PoolForm: FC<PoolFormProps> = ({ attendanceId, defaultValues, update, onClose }) => {
  const { pools } = useEventAttendanceGetQuery(attendanceId)
  const existingPools = [...new Set(pools?.map(({ yearCriteria }) => yearCriteria).flat())]
  const Form = useFormBuilder({
    schema: Schema,
    defaultValues: defaultValues || { yearCriteria: [], limit: 1 },
    fields: {
      yearCriteria: createLabelledCheckboxGroupInput({
        existing: existingPools,
        labels: ["sosialt", "1. klasse", "2. klasse", "3. klasse", "4. klasse", "5. klasse"],
      }),
      limit: createNumberInput({
        label: "Kapasitet",
      }),
    },
    label: "Opprett pulje",
    onSubmit: (values, form) => {
      // setError("yearCriteria", { type: "manual", message: "Velg minst en gruppe" })
      form.resetField("yearCriteria")
      onSubmit(values)
    },
  })

  const { mutate: createPool } = trpc.event.attendance.createPool.useMutation({
    onSuccess: () => {
      notifyComplete({
        title: "Pulje opprettet",
        message: "Puljen er opprettet",
      })
    },
  })

  const { mutate: updatePool } = trpc.event.attendance.updatePool.useMutation({
    onSuccess: () => {
      notifyComplete({
        title: "Pulje opprettet",
        message: "Puljen er opprettet",
      })
    },
  })

  const onSubmit = (values: Schema) => {
    try {
      validateAndReturn(values.yearCriteria)
      // form.reset()

      if (update) {
        updatePool({
          input: {
            limit: values.limit,
            yearCriteria: values.yearCriteria,
          },
          id: pools?.[0]?.id || "",
        })
        return
      }

      createPool({
        limit: values.limit,
        yearCriteria: values.yearCriteria,
        attendanceId,
      })
    } catch (e) {
      notifyFail({
        title: "Feil",
        message: (e as Error).message,
      })
    }
  }

  return (
    <Box>
      <Form />
      <Button onClick={onClose} mt={16} color="gray">
        Lukk
      </Button>
    </Box>
  )
}
