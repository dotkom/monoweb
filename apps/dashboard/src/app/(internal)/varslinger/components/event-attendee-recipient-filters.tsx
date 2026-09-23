"use client"

import type { AttendanceSelection } from "@dotkomonline/rpc/attendance"
import type {
  NotificationRecipientAttendanceSelectionOption,
  NotificationRecipientPaymentStatus,
  NotificationRecipientReservationStatus,
} from "@dotkomonline/rpc/notification"
import { TagInput, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"

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

function ChoiceGroup<TValue extends string>({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string
  value: TValue
  options: { label: string; value: TValue }[]
  disabled?: boolean
  onChange: (value: TValue) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <ToggleGroup
        multiple={false}
        disabled={disabled}
        value={[value]}
        onValueChange={(next) => {
          const selected = next.at(0)

          if (!selected) {
            return
          }

          onChange(selected as TValue)
        }}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

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
  const selectionOptions = selections
    .filter((selection) => selection.options.length > 0)
    .flatMap((selection) =>
      selection.options.map((option) => ({
        value: JSON.stringify({ selectionId: selection.id, optionId: option.id }),
        label: `${selection.name}: ${option.name}`,
      }))
    )
  const labelByValue = new Map(selectionOptions.map((option) => [option.value, option.label]))
  const valueByLabel = new Map(selectionOptions.map((option) => [option.label, option.value]))

  return (
    <div className="flex flex-col gap-3">
      <ChoiceGroup
        label="Påmeldingsstatus"
        value={reservationStatus}
        options={RESERVATION_STATUS_DATA}
        disabled={disabled}
        onChange={(value) =>
          onChange({
            reservationStatus: value,
            paymentStatus,
            attendanceSelectionOptions,
          })
        }
      />

      {hasPayment && (
        <ChoiceGroup
          label="Betalingsstatus"
          value={paymentStatus}
          options={PAYMENT_STATUS_DATA}
          disabled={disabled}
          onChange={(value) =>
            onChange({
              reservationStatus,
              paymentStatus: value,
              attendanceSelectionOptions,
            })
          }
        />
      )}

      {selectionOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Valg</span>
          <TagInput
            creatable={false}
            disabled={disabled}
            placeholder="Filtrer på valg"
            data={selectionOptions.map((option) => option.label)}
            value={(attendanceSelectionOptions ?? []).flatMap((selectionOption) => {
              const label = labelByValue.get(JSON.stringify(selectionOption))

              if (label === undefined) {
                return []
              }

              return [label]
            })}
            onChange={(labels) => {
              const values = labels.flatMap((label) => {
                const value = valueByLabel.get(label)

                if (value === undefined) {
                  return []
                }

                return [value]
              })
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
        </div>
      )}
    </div>
  )
}
