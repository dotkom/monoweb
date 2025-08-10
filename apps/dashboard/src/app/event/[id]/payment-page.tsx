import { Box, Button, Group, Input, Title } from "@mantine/core"
import { type FC, useRef } from "react"
import { useUpdateAttendancePaymentMutation } from "../mutations"
import { useAttendanceGetQuery } from "../queries"
import { useEventContext } from "./provider"

export const PaymentPage: FC = () => {
  const { attendanceId } = useEventContext()

  if (!attendanceId) {
    return (
      <Box>
        <Title>Lag en påmelding for å opprette betaling</Title>
      </Box>
    )
  }

  const updateAttendancePayment = useUpdateAttendancePaymentMutation()
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

    updateAttendancePayment.mutate({ id: attendanceId, price: newPrice })
  }

  const removePayment = async () => {
    // TODO: Use separate mutation for removing payment
    updateAttendancePayment.mutate({ id: attendanceId, price: 0 })
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
