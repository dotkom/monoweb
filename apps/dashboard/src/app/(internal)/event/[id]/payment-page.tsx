import { GenericTable } from "@/components/GenericTable"
import type { Attendee } from "@dotkomonline/types"
import { Badge, type BadgeProps, Box, Button, Group, Input, Stack, Title } from "@mantine/core"
import { IconExternalLink } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { type FC, useMemo, useRef } from "react"
import {
  useCreateAttendeePaymentAttendeeMutation,
  useRefundAttendeeMutation,
  useUpdateAttendancePaymentMutation,
} from "../mutations"
import { useEventContext } from "./provider"

export const PaymentPage: FC = () => {
  const { attendance } = useEventContext()

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

    const newPrice = inputRef.current ? Number.parseInt(inputRef.current.value, 10) : null
    if (!newPrice) {
      return
    }

    updateAttendancePayment.mutate({ id: attendance?.id, price: newPrice })
  }

  const removePayment = async () => {
    updateAttendancePayment.mutate({ id: attendance?.id, price: null })
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

          let badge: BadgeProps = {}

          if (value.paymentRefundedAt) {
            badge = { color: "gray", children: "Refundert" }
          } else if (value.paymentChargedAt) {
            badge = { color: "green", children: "Betalt" }
          } else if (value.paymentReservedAt) {
            badge = { color: "blue", children: "Reservert" }
          } else if (!value.paymentRefundedAt && value.paymentRefundedById) {
            badge = { color: "gray", children: "Kansellert" }
          } else if (value.paymentDeadline) {
            badge = { color: "red", children: "Ikke betalt" }
          } else {
            badge = { color: "gray", children: "Ingen betaling" }
          }

          return <Badge {...badge} />
        },
      }),
      columnHelper.accessor((attendee) => attendee.paymentCheckoutUrl, {
        header: "Betalingslenke",
        cell: (info) => {
          const value = info.getValue()

          if (!value) return

          return (
            <Link
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              Åpne i Stripe
              <IconExternalLink size="16" />
            </Link>
          )
        },
      }),
      columnHelper.accessor((attendee) => attendee, {
        header: "Handling",
        cell: (info) => {
          const attendee = info.getValue()

          if (attendee.paymentChargedAt && !attendee.paymentRefundedAt) {
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
          if (attendee.paymentId === null || attendee.paymentRefundedAt) {
            return (
              <Button
                size="xs"
                color="orange"
                onClick={() =>
                  createAttendeePaymentMutation.mutate({
                    attendeeId: attendee.id,
                  })
                }
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
