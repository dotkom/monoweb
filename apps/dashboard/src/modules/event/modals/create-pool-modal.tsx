import { Box, Button, Checkbox, NumberInput, Title } from "@mantine/core"
import { modals, type ContextModalProps } from "@mantine/modals"
import React, { useState, type FC } from "react"
import { notifyComplete, notifyFail } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"
import { useEventAttendanceGetQuery } from "../queries/use-event-attendance-get-query"

const YearForm = ({
  toAddNum,
  setToAddNum,
}: {
  toAddNum: boolean[]
  setToAddNum: React.Dispatch<React.SetStateAction<boolean[]>>
}) => {
  const labels = ["sosialt", "1. klasse", "2. klasse", "3. klasse", "4. klasse", "5. klasse"]

  return (
    <table>
      {toAddNum.map((idx, i) => (
        <tbody key={i}>
          <tr>
            <td width="100">{labels[i]}</td>
            <td>
              <Checkbox
                checked={idx}
                onChange={(e) => {
                  const newToAddNum = [...toAddNum]
                  newToAddNum[i] = e.currentTarget.checked
                  setToAddNum(newToAddNum)
                }}
              />
            </td>
          </tr>
        </tbody>
      ))}
    </table>
  )
}

const poolOverlaps = (pools: { min: number; max: number }[]): boolean =>
  pools.some((pool, i) => pools.some((otherPool, j) => i !== j && pool.min < otherPool.max && pool.max > otherPool.min))

const isConsecutive = (arr: number[]): boolean => arr.every((num, idx) => idx === 0 || num === arr[idx - 1] + 1)

interface PoolModalProps {
  eventId: string
}

export const CreatePoolModal: FC<ContextModalProps<PoolModalProps>> = ({ context, id, innerProps }) => {
  const { mutate: addAttendance } = trpc.event.attendance.create.useMutation()
  const { eventAttendance: existingPools } = useEventAttendanceGetQuery(innerProps.eventId)

  const onSubmit = (values: { min: number; max: number; limit: number }) => {
    addAttendance({
      start: new Date(), // TODO: functionality missing
      end: new Date(), // TODO: functionality missing
      deregisterDeadline: new Date(), // TODO: functionality missing
      eventId: innerProps.eventId,
      limit: values.limit,
      min: values.min,
      max: values.max,
      attendees: [],
    })
  }

  const [toAddNum, setToAddNum] = useState([false, false, false, false, false, false])
  const [limit, setLimit] = useState(20)

  // validates and returns {max, min } if valid
  function validateAndReturn(): { min: number; max: number } {
    // check if there are gaps in toAddNum, i.e. [1, 3] is not allowed. but [1, 2, 3] is allowed. [3, 5] is not allowed, but [3, 4, 5] is allowed.

    // transform from [false, true, false, true, false, false] to [1, 3]
    const chosen = toAddNum
      .map((value, index) => [index, value] as [number, boolean])
      .filter(([_, value]) => value)
      .map(([index]) => index)

    const min = chosen.length ? Math.min(...chosen) : -1
    const max = chosen.length ? Math.max(...chosen) + 1 : -1

    checkNumber(min, max)
    checkConsecutive(chosen)
    checkOverlaps(min, max)

    return {
      min,
      max,
    }
  }

  const checkOverlaps = (min: number, max: number) => {
    const overlapsWithExistingPools = poolOverlaps([...existingPools, { min, max }])
    if (overlapsWithExistingPools) {
      throw new Error("Klassetrinnene overlapper med en eksisterende pulje")
    }
  }

  const checkConsecutive = (chosenNumbers: number[]) => {
    // Can only choose consecutive numbers
    const sorted = chosenNumbers.sort((a, b) => a - b)
    if (!isConsecutive(sorted)) {
      throw new Error("Du kan ikke hoppe over klassetrinn")
    }
  }

  const checkNumber = (min: number, max: number) => {
    if (min === max) {
      // works because min is inclusive and max is exclusive, and both are -1 if no numbers are chosen
      throw new Error("Du må velge minst ett klassetrinn")
    }
  }

  return (
    <Box>
      <Title order={5}>Velg klassetrinn</Title>
      <YearForm toAddNum={toAddNum} setToAddNum={setToAddNum} />
      <Title order={5}>Kapasitet</Title>
      <NumberInput value={limit} onChange={(value) => setLimit(Number(value))} />
      <Button
        onClick={() => {
          try {
            const { min, max } = validateAndReturn()
            setToAddNum([false, false, false, false, false, false])
            onSubmit({ min, max, limit })
            notifyComplete({
              title: "Pulje opprettet",
              message: "Puljen ble opprettet",
            })
          } catch (e) {
            notifyFail({
              title: "Feil",
              message: (e as Error).message,
            })
          }
        }}
        mt={16}
        mr={8}
      >
        Lag ny pulje
      </Button>
      <Button onClick={() => context.closeModal(id)} mt={16} color="gray">
        Lukk
      </Button>
    </Box>
  )
}

export const useCreatePoolModal =
  ({ eventId }: PoolModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/create-pool",
      title: "Ny pulje",
      innerProps: {
        eventId,
      },
    })
