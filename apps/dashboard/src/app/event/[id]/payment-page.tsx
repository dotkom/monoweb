import { Box, Button, Group, Input, Title } from "@mantine/core"
import { type FC, useRef } from "react"
import { useUpdateAttendancePaymentMutation } from "../mutations"
import { useEventContext } from "./provider"

export const PaymentPage: FC = () => {
  const { attendance } = useEventContext()

  if (!attendance) {
    return (
      <Box>
        <Title>Lag en påmelding for å opprette betaling</Title>
      </Box>
    )
  }

  const updateAttendancePayment = useUpdateAttendancePaymentMutation()
  const hasPayment = Boolean(attendance.attendancePrice)

  const inputRef = useRef<HTMLInputElement>(null)

  const createPayment = async () => {
    if (!attendance) {
      throw new Error("Tried to create payment without an attendance")
    }

    const newPrice = inputRef.current ? Number.parseInt(inputRef.current.value) : null
    if (!newPrice) {
      return
    }

    updateAttendancePayment.mutate({ id: attendance.id, price: newPrice })
  }

  const removePayment = async () => {
    // TODO: Use separate mutation for removing payment
    updateAttendancePayment.mutate({ id: attendance.id, price: 0 })
  }

  return (
    <Box>
      <Title>Betaling for påmelding</Title>
      <Group>
        <Input defaultValue={attendance.attendancePrice?.toString()} ref={inputRef} placeholder="Beløp" />
        <Button onClick={createPayment}>{hasPayment ? "Endre pris" : "Opprett betaling"}</Button>
        {hasPayment && <Button onClick={removePayment}>Fjern betaling</Button>}
      </Group>
    </Box>
  )
}
