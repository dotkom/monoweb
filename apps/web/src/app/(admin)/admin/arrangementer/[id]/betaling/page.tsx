"use client"

import { PaymentStatusBadge } from "../../components/PaymentStatusBadge"
import { AttendeePaymentActions } from "./AttendeePaymentActions"

import { FilterableDataTable } from "@admin/components/FilterableDataTable"
import { TextField } from "@admin/components/forms/TextField"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import { Button, Title } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconExternalLink } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEventContext } from "../provider"
import { useUpdateAttendancePaymentMutation } from "../../mutations"
import { useEventEditPermission } from "../../use-event-edit-permission"

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
  const registeredAttendees = useMemo(
    () => attendance?.attendees.filter((attendee) => attendee.registeredAt !== null) ?? [],
    [attendance]
  )
  const hasPayment = attendance?.attendancePrice != null && attendance.attendancePrice > 0

  const savedPrice = hasPayment ? String(attendance.attendancePrice) : ""

  const form = useForm<PriceFormValues>({
    defaultValues: { price: savedPrice },
    resolver: zodResolver(PriceFormSchema),
    disabled: !canEdit,
  })

  useEffect(() => {
    form.reset({ price: savedPrice })
  }, [form, savedPrice])

  const onSubmit = form.handleSubmit((values) => {
    if (attendance === null) {
      return
    }
    updateAttendancePayment.mutate({ id: attendance.id, price: Number(values.price) })
  })

  const removePayment = () => {
    if (attendance === null) {
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

          return <PaymentStatusBadge payment={value.payment} />
        },
      }),
      columnHelper.accessor((attendee) => attendee.payment?.stripeDashboardUrl ?? null, {
        header: "Betalingslenke",
        cell: (info) => {
          const value = info.getValue()

          if (value === null) {
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

          return <AttendeePaymentActions attendee={attendee} canEdit={canEdit} />
        },
      }),
    ],
    [canEdit]
  )

  const tableOptions = useMemo(
    () => ({
      data: registeredAttendees,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [registeredAttendees, columns]
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
