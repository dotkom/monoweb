import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Checkbox, NumberInput, Title } from "@mantine/core"
import { type FC } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { validateAndReturn } from "./utils"
import { notifyComplete, notifyFail } from "../../../../app/notifications"
import { trpc } from "../../../../utils/trpc"
import { useEventAttendanceGetQuery } from "../../queries/use-event-attendance-get-query"

interface YearFormProps {
  selected: number[]
  setSelected(value: number[]): void
  existing: number[]
}

const YearForm = ({ selected, existing, setSelected }: YearFormProps) => {
  const labels = ["sosialt", "1. klasse", "2. klasse", "3. klasse", "4. klasse", "5. klasse"]

  return (
    <table>
      {labels.map((label, idx) => (
        <tbody key={idx}>
          <tr>
            <td width="100">{label}</td>
            <td>
              <Checkbox
                checked={selected.includes(idx)}
                disabled={existing.includes(idx)}
                onChange={() => {
                  const includes = selected.includes(idx)
                  if (includes) {
                    setSelected(selected.filter((a) => a !== idx))
                  } else {
                    setSelected([...selected, idx])
                  }
                }}
              />
            </td>
          </tr>
        </tbody>
      ))}
    </table>
  )
}

export default YearForm

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
  const form = useForm({
    resolver: zodResolver(Schema),
    defaultValues: defaultValues || {
      yearCriteria: [] as number[],
      limit: 20,
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

  const { pools } = useEventAttendanceGetQuery(attendanceId)
  const onSubmit = (values: Schema) => {
    try {
      validateAndReturn(values.yearCriteria)
      form.reset()

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

  const existingPools = [...new Set(pools?.map((a) => a.yearCriteria).flat())]
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Title order={5}>Velg klassetrinn</Title>
      <Controller
        control={form.control}
        name="yearCriteria"
        render={({ field: { onChange, value } }) => (
          <YearForm setSelected={onChange} selected={value} existing={existingPools} />
        )}
      />
      <Title order={5}>Kapasitet</Title>
      <Controller
        control={form.control}
        name="limit"
        render={({ field: { onChange, value } }) => (
          <NumberInput
            onChange={onChange} // send value to hook form
            value={value} // get value from hook form
          />
        )}
      />
      <Button mt={16} mr={8} type="submit">
        Lag ny pulje
      </Button>
      <Button onClick={onClose} mt={16} color="gray">
        Lukk
      </Button>
    </form>
  )
}
