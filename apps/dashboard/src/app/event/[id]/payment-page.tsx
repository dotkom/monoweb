import { GenericTable } from "@/components/GenericTable"
import type { Attendee } from "@dotkomonline/types"
import { Badge, Box, Button, Group, Input, Stack, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { type FC, useMemo, useRef } from "react"
import {
  useCreateAttendeePaymentAttendeeMutation,
  useRefundAttendeeMutation,
  useUpdateAttendancePaymentMutation,
} from "../mutations"
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
  const reservedAttendees = useMemo(
    () => attendance?.attendees.filter((attendee) => attendee.reserved) ?? [],
    [attendance]
  )
  const hasPayment = Boolean(attendance?.attendancePrice)

  const inputRef = useRef<HTMLInputElement>(null)

  const refundAttendeeMutation = useRefundAttendeeMutation()
  const createAttendeePaymentMutation = useCreateAttendeePaymentAttendeeMutation()

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
    updateAttendancePayment.mutate({ id: attendance.id, price: null })
  }

  const columnHelper = createColumnHelper<Attendee>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((attendee) => attendee.user.name, {
        id: "user",
        header: "Bruker",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor((attendee) => attendee, {
        header: "Betaling",
        cell: (info) => {
          const value = info.getValue()

          if (value.paymentChargedAt) {
            return <Badge color="green">Betalt</Badge>
          }
          if (value.paymentReservedAt) {
            return <Badge color="blue">Betaling reservert</Badge>
          }
          if (value.paymentRefundedAt) {
            return <Badge color="indigo">Betaling refundert</Badge>
          }
          if (value.paymentId) {
            return <Badge color="yellow">Venter på betaling</Badge>
          }

          return <Badge color="gray">Ingen betaling</Badge>
        },
      }),
      columnHelper.accessor((attendee) => attendee, {
        header: "Handling",
        cell: (info) => {
          const attendee = info.getValue()

          if (attendee.paymentChargedAt) {
            return (
              <Button
                size="xs"
                color="indigo"
                onClick={() => refundAttendeeMutation.mutate({ attendeeId: attendee.id })}
              >
                Refunder
              </Button>
            )
          }
          if (attendee.paymentId === null) {
            return (
              <Button
                size="xs"
                color="orange"
                onClick={() => createAttendeePaymentMutation.mutate({ attendeeId: attendee.id })}
              >
                Ny betaling
              </Button>
            )
          }
          return (
            <Button size="xs" color="yellow" onClick={() => refundAttendeeMutation.mutate({ attendeeId: attendee.id })}>
              Avbryt betaling
            </Button>
          )
        },
      }),
    ],
    [columnHelper, refundAttendeeMutation, createAttendeePaymentMutation]
  )

  const tableOptions = useMemo(
    () => ({
      data: reservedAttendees,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [reservedAttendees, columns]
  )

  const table = useReactTable(tableOptions)

  return (
    <Stack gap="lg">
      <Box>
        <Title order={2}>Pris for betaling</Title>
        <Group>
          <Group>
            <Input defaultValue={attendance?.attendancePrice?.toString()} ref={inputRef} placeholder="Beløp" />
          </Group>
          <Button onClick={createPayment}>{hasPayment ? "Endre pris" : "Opprett betaling"}</Button>
          {hasPayment && <Button onClick={removePayment}>Fjern betaling</Button>}
        </Group>
      </Box>

      <Box>
        <Title order={2}>Brukere</Title>
        <GenericTable table={table} />
      </Box>
    </Stack>
  )
}
