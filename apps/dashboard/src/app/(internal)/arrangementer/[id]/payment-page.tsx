import { GenericTable } from "@/components/GenericTable"
import {
  type AttendeePaymentStatus,
  type Attendee,
  getAttendeePaymentStatus,
  isAttendeeChargedAndUnrefunded,
} from "@dotkomonline/rpc/attendance"
import { Badge, type BadgeProps, Box, Button, Group, Input, Stack, Title } from "@mantine/core"
import { IconExternalLink } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { type FC, useMemo, useRef } from "react"
import { useEventEditPermission } from "@/hooks/use-event-edit-permission"
import {
  useCreateAttendeePaymentAttendeeMutation,
  useRefundAttendeeMutation,
  useUpdateAttendancePaymentMutation,
} from "../mutations"
import { useEventContext } from "./provider"

const PAYMENT_STATUS_BADGE: Record<AttendeePaymentStatus, BadgeProps> = {
  refunded: { color: "gray", children: "Refundert" },
  charged: { color: "green", children: "Betalt" },
  reserved: { color: "blue", children: "Reservert" },
  cancelled: { color: "gray", children: "Kansellert" },
  pending: { color: "red", children: "Ikke betalt" },
  none: { color: "gray", children: "Ingen betaling" },
}

export const PaymentPage: FC = () => {
  const { attendance } = useEventContext()
  const { canEdit } = useEventEditPermission()

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

    updateAttendancePayment.mutate({ id: attendance.id, price: newPrice })
  }

  const removePayment = async () => {
    if (!attendance) {
      throw new Error("Tried to create payment without an attendance")
    }

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
          const props = PAYMENT_STATUS_BADGE[getAttendeePaymentStatus(value)]

          return <Badge {...props} />
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

          if (isAttendeeChargedAndUnrefunded(attendee)) {
            return (
              <Button
                size="xs"
                color="indigo"
                disabled={!canEdit}
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
                disabled={!canEdit}
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
            <Button
              size="xs"
              color="yellow"
              disabled={!canEdit}
              onClick={() => refundAttendeeMutation.mutate({ attendeeId: attendee.id })}
            >
              Avbryt betaling
            </Button>
          )
        },
      }),
    ],
    [columnHelper, refundAttendeeMutation, createAttendeePaymentMutation, canEdit]
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
            <Input
              defaultValue={attendance?.attendancePrice?.toString()}
              ref={inputRef}
              placeholder="Beløp"
              disabled={!canEdit}
            />
          </Group>
          <Button onClick={createPayment} disabled={!canEdit}>
            {hasPayment ? "Endre pris" : "Opprett betaling"}
          </Button>
          {hasPayment && (
            <Button onClick={removePayment} disabled={!canEdit}>
              Fjern betaling
            </Button>
          )}
        </Group>
      </Box>

      <Box>
        <Title order={2}>Brukere</Title>
        <GenericTable table={table} />
      </Box>
    </Stack>
  )
}
