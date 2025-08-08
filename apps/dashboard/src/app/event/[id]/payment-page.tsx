import { Box, Button, Group, Input, Title } from "@mantine/core"
import { useRef, type FC } from "react"
import { useEventContext } from "./provider"
import { useUpdateAttendanceMutation } from "../mutations"
import { useAttendanceGetQuery } from "../queries"

export const PaymentPage: FC = () => {
  const { attendanceId } = useEventContext()

  if (!attendanceId) {
    return (
      <Box>
        <Title>Lag en påmelding for å opprette betaling</Title>
      </Box>
    )
  }

  const updateAttendance = useUpdateAttendanceMutation()
  const attendance = useAttendanceGetQuery(attendanceId)
  const hasPayment = Boolean(attendance?.data?.attendancePrice)

  const inputRef = useRef<HTMLInputElement>(null)

  const createPayment = async () => {
    if (!attendanceId) {
      throw new Error("Tried to create payment without an attendance")
    }

    const newPrice = inputRef.current ? Number.parseInt(inputRef.current.value) : null
    if (!newPrice) {
      return
    }

    updateAttendance.mutate({ id: attendanceId, attendance: { attendancePrice: newPrice } })
  }

  const removePayment = async () => {
    updateAttendance.mutate({ id: attendanceId, attendance: { attendancePrice: null } })
  }

  return (
    <Box>
      <Title>Betaling for påmelding</Title>
      <Group>
        <Input defaultValue={attendance?.data?.attendancePrice?.toString()} ref={inputRef} placeholder="Beløp" />
        <Button onClick={createPayment}>{hasPayment ? "Endre pris" : "Opprett betaling"}</Button>
        {hasPayment && <Button onClick={removePayment}>Fjern betaling</Button>}
      </Group>
    </Box>
  )
}
