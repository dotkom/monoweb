"use client"

import { PaymentStatusBadge } from "../../components/PaymentStatusBadge"
import { AttendeePaymentActions } from "./AttendeePaymentActions"

import { FilterableDataTable } from "@admin/components/FilterableDataTable"
import { TextField } from "@admin/components/forms/TextField"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import { Button, Text, Title } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconArrowUpRight } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEventContext } from "../provider"
import { useUpdateAttendancePaymentMutation } from "../../mutations"
import { useEventEditPermission } from "../../use-event-edit-permission"
import { env } from "@/env"

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
const currencyFormatter = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" })
const stripeDashboardUrl = env.NEXT_PUBLIC_STRIPE_DASHBOARD_URL.replace(/\/$/, "")

export default function EventPaymentPage() {
  const { event, attendance } = useEventContext()
  const { canEdit } = useEventEditPermission()

  const updateAttendancePayment = useUpdateAttendancePaymentMutation()
  const paymentAttendees = useMemo(
    () => attendance?.attendees.filter((attendee) => attendee.registeredAt !== null || attendee.payment !== null) ?? [],
    [attendance]
  )
  const hasPayment = attendance?.attendancePrice != null && attendance.attendancePrice > 0

  const savedPrice = hasPayment ? String(attendance.attendancePrice) : ""
  const stripeSearchQuery = `metadata:event_id=${event.id}`
  const stripeSearchUrl = `${stripeDashboardUrl}/search?${new URLSearchParams({ query: stripeSearchQuery })}`
  const stripeProductUrl = `${stripeDashboardUrl}/products/${encodeURIComponent(`event_${event.id}`)}`

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

  const removePrice = () => {
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
      columnHelper.accessor((attendee) => attendee.payment?.amountOre ?? null, {
        id: "amount",
        header: "Avtalt beløp",
        cell: (info) => {
          const amountOre = info.getValue()

          return amountOre === null ? "—" : currencyFormatter.format(amountOre / 100)
        },
      }),
      columnHelper.accessor((attendee) => attendee.payment?.refundedAmountOre ?? null, {
        id: "refundedAmount",
        header: "Refundert",
        cell: (info) => {
          const amountOre = info.getValue()

          return amountOre === null ? "—" : currencyFormatter.format(amountOre / 100)
        },
      }),
      columnHelper.accessor((attendee) => attendee.payment?.stripeDashboardUrl ?? null, {
        header: "Betalingslenke",
        cell: (info) => {
          const value = info.getValue()

          if (value === null) {
            return null
          }

          const paymentUrl = `${stripeDashboardUrl}${new URL(value).pathname}`

          return (
            <Button element={Link} href={paymentUrl} target="_blank" rel="noopener noreferrer" size="sm">
              Åpne i Stripe
              <IconArrowUpRight size="16" />
            </Button>
          )
        },
      }),
      columnHelper.accessor((attendee) => attendee, {
        header: "Handling",
        cell: (info) => {
          const attendee = info.getValue()

          return <AttendeePaymentActions attendee={attendee} canEdit={canEdit} hasAttendancePrice={hasPayment} />
        },
      }),
    ],
    [canEdit, hasPayment]
  )

  const tableOptions = useMemo(
    () => ({
      data: paymentAttendees,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [paymentAttendees, columns]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Title className="text-2xl">Pris for nye betalinger</Title>
        <Text>
          Prisen brukes når en deltaker får opprettet en betaling. Eksisterende betalinger og nye betalingslenker for
          disse beholder det avtalte beløpet i tabellen. En prisendring trekker eller refunderer ikke penger.
        </Text>
        <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-2">
          <TextField control={form.control} name="price" placeholder="Beløp" fixedWidth inputMode="numeric" />
          <Button type="submit" variant="default" disabled={!canEdit || updateAttendancePayment.isPending}>
            {hasPayment ? "Lagre ny pris" : "Sett pris"}
          </Button>
          {hasPayment && (
            <Button variant="secondary" onClick={removePrice} disabled={!canEdit || updateAttendancePayment.isPending}>
              Fjern pris for nye betalinger
            </Button>
          )}
        </form>
        <Text className="text-sm text-muted-foreground">
          Å fjerne prisen avbryter ikke eksisterende betalingslenker, reservasjoner eller planlagte trekk. Bruk
          handlingene på hver deltaker for å avbryte, refundere eller frita fra betaling.
        </Text>
      </div>

      <div className="flex flex-col gap-4">
        <Title className="text-2xl">Stripe</Title>
        <div className="flex flex-wrap gap-4">
          <Button element={Link} href={stripeSearchUrl} target="_blank" rel="noopener noreferrer">
            Finn arrangementets betalinger i Stripe
            <IconArrowUpRight size="16" />
          </Button>
          <Button element={Link} href={stripeProductUrl} target="_blank" rel="noopener noreferrer">
            Åpne arrangementsprodukt i Stripe
            <IconArrowUpRight size="16" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Title className="text-2xl">Betalinger og påmeldte</Title>
        <FilterableDataTable tableOptions={tableOptions} />
      </div>
    </div>
  )
}
