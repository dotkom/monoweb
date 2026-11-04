"use client"

import {
  useEventWithAttendancesByAttendanceIdGetQuery,
  useEventWithAttendancesGetQuery,
} from "@admin/arrangementer/queries"
import { useAuthorization } from "@admin/auth/authorization-context"
import { EventSelectInput } from "@admin/components/forms/EventSelectInput"
import type { Event } from "@dotkomonline/rpc/event"
import { canTargetEventAttendees } from "@dotkomonline/rpc/notification-permissions"
import { Label, Text } from "@dotkomonline/ui"
import { useEffect, useId, useMemo } from "react"
import { EventAttendeeRecipientFilters } from "../EventAttendeeRecipientFilters"
import type { RecipientRuleDraft } from "./recipient-selection-draft"

export function EventAttendeesFields({
  draft,
  onChange,
}: {
  draft: Extract<RecipientRuleDraft, { type: "EVENT_ATTENDEES" }>
  onChange: (draft: RecipientRuleDraft) => void
}) {
  const authorization = useAuthorization()

  const targetableGroupSlugs = useMemo(() => {
    const hostingGroups = [...authorization.groups].map(([slug, type]) => ({ slug, type }))
    const targetableGroups = hostingGroups.filter((group) => canTargetEventAttendees(authorization, [group]))

    return targetableGroups.map((group) => group.slug)
  }, [authorization])

  const eventFilters = authorization.isAdministrator ? undefined : { byOrganizingGroup: targetableGroupSlugs }
  const isEventSelectable = (event: Event) => canTargetEventAttendees(authorization, event.hostingGroups)

  const hasSelectedEvent = draft.eventId !== null
  const selectedEventQuery = useEventWithAttendancesGetQuery(draft.eventId ?? "", hasSelectedEvent)
  const savedEventQuery = useEventWithAttendancesByAttendanceIdGetQuery(
    draft.attendanceId ?? "",
    !hasSelectedEvent && draft.attendanceId !== null
  )
  const eventWithAttendance = hasSelectedEvent ? selectedEventQuery.data : savedEventQuery.data
  const selectedEventId = draft.eventId ?? eventWithAttendance?.event.id ?? ""

  const attendance = eventWithAttendance?.attendance ?? null
  const hasPayment = attendance?.attendancePrice != null
  const attendanceSelections = attendance?.selections ?? []
  const shouldShowMissingAttendanceMessage = eventWithAttendance !== undefined && attendance === null

  const eventSelectId = useId()

  useEffect(() => {
    if (eventWithAttendance === undefined) {
      return
    }

    const nextAttendanceId = attendance?.id ?? null

    if (nextAttendanceId === draft.attendanceId) {
      return
    }

    const nextDraft = {
      ...draft,
      attendanceId: nextAttendanceId,
      attendanceSelectionOptions: null,
    }

    onChange(nextDraft)
  }, [attendance, eventWithAttendance, draft, onChange])

  const handleEventChange = (eventId: string) => {
    const selectedEventId = eventId.length > 0 ? eventId : null

    onChange({
      ...draft,
      eventId: selectedEventId,
      attendanceId: null,
      attendanceSelectionOptions: null,
      reservationStatus: "RESERVED",
      paymentStatus: "ALL",
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={eventSelectId}>Arrangement</Label>
      <EventSelectInput
        id={eventSelectId}
        placeholder="Velg arrangement"
        filters={eventFilters}
        isEventSelectable={isEventSelectable}
        value={selectedEventId}
        onChange={handleEventChange}
      />

      {shouldShowMissingAttendanceMessage && (
        <Text className="text-sm text-muted-foreground">Arrangementet har ingen påmelding</Text>
      )}

      <EventAttendeeRecipientFilters
        reservationStatus={draft.reservationStatus}
        paymentStatus={draft.paymentStatus}
        attendanceSelectionOptions={draft.attendanceSelectionOptions}
        hasPayment={hasPayment}
        selections={attendanceSelections}
        disabled={attendance === null}
        onChange={(next) => onChange({ ...draft, ...next })}
      />
    </div>
  )
}
