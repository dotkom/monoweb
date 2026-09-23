"use client"

import { FilterableDataTable } from "@/components/FilterableDataTable"
import { TextField } from "@/components/forms/TextField"
import {
  type Attendee,
  type AttendeePaymentStatus,
  getAttendeePaymentStatus,
  isAttendeeChargedAndUnrefunded,
} from "@dotkomonline/rpc/attendance"
import { Badge, type BadgeColor, Button, Title } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconExternalLink } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEventContext } from "../provider"
import {
  useCreateAttendeePaymentAttendeeMutation,
  useRefundAttendeeMutation,
  useUpdateAttendancePaymentMutation,
} from "../../mutations"
import { useEventEditPermission } from "../../use-event-edit-permission"

const PAYMENT_STATUS_BADGE: Record<AttendeePaymentStatus, { color: BadgeColor; children: string }> = {
  refunded: { color: "gray", children: "Refundert" },
  charged: { color: "green", children: "Betalt" },
  reserved: { color: "blue", children: "Reservert" },
  cancelled: { color: "gray", children: "Kansellert" },
  pending: { color: "red", children: "Ikke betalt" },
  none: { color: "gray", children: "Ingen betaling" },
}

const STRIPE_MIN_PRICE = 3

const PriceFormSchema = z.object({
  price: z
    .string()
    .trim()
    .min(1, "Skriv inn en pris")
    .regex(/^\d+$/, "Prisen må være et heltall")
    .refine((value) => Number(value) >= STRIPE_MIN_PRICE, `Prisen må være minst ${STRIPE_MIN_PRICE} kr`),
})
type PriceFormValues = z.infer<typeof PriceFormSchema>

const columnHelper = createColumnHelper<Attendee>()

export default function EventPaymentPage() {
  const { attendance } = useEventContext()
  const { canEdit } = useEventEditPermission()

  const updateAttendancePayment = useUpdateAttendancePaymentMutation()
  const reservedAttendees = useMemo(
    () => attendance?.attendees.filter((attendee) => attendee.reserved) ?? [],
    [attendance]
  )
  const hasPayment = Boolean(attendance?.attendancePrice)

  const refundAttendeeMutation = useRefundAttendeeMutation()
  const createAttendeePaymentMutation = useCreateAttendeePaymentAttendeeMutation()

  const savedPrice = attendance?.attendancePrice ? String(attendance.attendancePrice) : ""

  const form = useForm<PriceFormValues>({
    defaultValues: { price: savedPrice },
    resolver: zodResolver(PriceFormSchema),
    disabled: !canEdit,
  })

  useEffect(() => {
    form.reset({ price: savedPrice })
  }, [form, savedPrice])

  const onSubmit = form.handleSubmit((values) => {
    if (!attendance) {
      return
    }
    updateAttendancePayment.mutate({ id: attendance.id, price: Number(values.price) })
  })

  const removePayment = () => {
    if (!attendance) {
      return
    }
    updateAttendancePayment.mutate({ id: attendance.id, price: null })
  }

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

          return <Badge color={props.color}>{props.children}</Badge>
        },
      }),
      columnHelper.accessor((attendee) => attendee.paymentCheckoutUrl, {
        header: "Betalingslenke",
        cell: (info) => {
          const value = info.getValue()

          if (!value) {
            return null
          }

          return (
            <Link href={value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
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
                size="sm"
                variant="default"
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
                size="sm"
                variant="secondary"
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
              size="sm"
              variant="secondary"
              disabled={!canEdit}
              onClick={() => refundAttendeeMutation.mutate({ attendeeId: attendee.id })}
            >
              Avbryt betaling
            </Button>
          )
        },
      }),
    ],
    [refundAttendeeMutation, createAttendeePaymentMutation, canEdit]
  )

  const tableOptions = useMemo(
    () => ({
      data: reservedAttendees,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [reservedAttendees, columns]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Title className="text-2xl">Pris for betaling</Title>
        <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-2">
          <TextField control={form.control} name="price" placeholder="Beløp" fixedWidth inputMode="numeric" />
          <Button type="submit" variant="default" disabled={!canEdit || updateAttendancePayment.isPending}>
            {hasPayment ? "Endre pris" : "Opprett betaling"}
          </Button>
          {hasPayment && (
            <Button
              variant="secondary"
              onClick={removePayment}
              disabled={!canEdit || updateAttendancePayment.isPending}
            >
              Fjern betaling
            </Button>
          )}
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <Title className="text-2xl">Brukere</Title>
        <FilterableDataTable tableOptions={tableOptions} />
      </div>
    </div>
  )
}
