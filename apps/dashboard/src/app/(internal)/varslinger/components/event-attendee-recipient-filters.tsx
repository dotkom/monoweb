"use client"

import type { AttendanceSelection } from "@dotkomonline/rpc/attendance"
import type {
  NotificationRecipientAttendanceSelectionOption,
  NotificationRecipientPaymentStatus,
  NotificationRecipientReservationStatus,
} from "@dotkomonline/rpc/notification"
import { Input, MultiSelect, SegmentedControl, Stack } from "@mantine/core"

const RESERVATION_STATUS_DATA: { label: string; value: NotificationRecipientReservationStatus }[] = [
  { label: "Alle", value: "ALL" },
  { label: "Påmeldte", value: "RESERVED" },
  { label: "I kø", value: "UNRESERVED" },
]

const PAYMENT_STATUS_DATA: { label: string; value: NotificationRecipientPaymentStatus }[] = [
  { label: "Alle", value: "ALL" },
  { label: "Betalt", value: "PAID" },
  { label: "Ikke betalt", value: "UNPAID" },
]

export function EventAttendeeRecipientFilters({
  reservationStatus,
  paymentStatus,
  attendanceSelectionOptions,
  hasPayment,
  selections,
  disabled = false,
  onChange,
}: {
  reservationStatus: NotificationRecipientReservationStatus
  paymentStatus: NotificationRecipientPaymentStatus
  attendanceSelectionOptions: NotificationRecipientAttendanceSelectionOption[] | null
  hasPayment: boolean
  selections: AttendanceSelection[]
  disabled?: boolean
  onChange: (next: {
    reservationStatus: NotificationRecipientReservationStatus
    paymentStatus: NotificationRecipientPaymentStatus
    attendanceSelectionOptions: NotificationRecipientAttendanceSelectionOption[] | null
  }) => void
}) {
  const selectionOptionSelectData = selections
    .filter((selection) => selection.options.length > 0)
    .map((selection) => ({
      group: selection.name,
      items: selection.options.map((option) => ({
        value: JSON.stringify({ selectionId: selection.id, optionId: option.id }),
        label: option.name,
      })),
    }))

  return (
    <Stack gap="xs">
      <Input.Wrapper label="Påmeldingsstatus">
        <Stack>
          <SegmentedControl
            size="xs"
            w="13rem"
            disabled={disabled}
            value={reservationStatus}
            data={RESERVATION_STATUS_DATA}
            onChange={(value) =>
              onChange({
                reservationStatus: value as NotificationRecipientReservationStatus,
                paymentStatus,
                attendanceSelectionOptions,
              })
            }
          />
        </Stack>
      </Input.Wrapper>

      {hasPayment && (
        <Input.Wrapper label="Betalingsstatus">
          <Stack>
            <SegmentedControl
              size="xs"
              w="16rem"
              disabled={disabled}
              value={paymentStatus}
              data={PAYMENT_STATUS_DATA}
              onChange={(value) =>
                onChange({
                  reservationStatus,
                  paymentStatus: value as NotificationRecipientPaymentStatus,
                  attendanceSelectionOptions,
                })
              }
            />
          </Stack>
        </Input.Wrapper>
      )}

      {selectionOptionSelectData.length > 0 && (
        <MultiSelect
          searchable
          clearable
          label="Valg"
          placeholder="Filtrer på valg"
          disabled={disabled}
          data={selectionOptionSelectData}
          value={(attendanceSelectionOptions ?? []).map((selectionOption) => JSON.stringify(selectionOption))}
          onChange={(values) => {
            let nextAttendanceSelectionOptions: NotificationRecipientAttendanceSelectionOption[] | null = null

            if (values.length > 0) {
              nextAttendanceSelectionOptions = values.map(
                (value) => JSON.parse(value) as NotificationRecipientAttendanceSelectionOption
              )
            }

            onChange({
              reservationStatus,
              paymentStatus,
              attendanceSelectionOptions: nextAttendanceSelectionOptions,
            })
          }}
        />
      )}
    </Stack>
  )
}
