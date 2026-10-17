"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { NoAccessNotice } from "@admin/components/NoAccessNotice"
import { useGroupAbbreviationMap } from "@admin/grupper/queries"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import {
  type CommitteeApplicationInterviewDuration,
  DEFAULT_COMMITTEE_APPLICATION_INTERVIEW_DURATION,
} from "@dotkomonline/rpc/committee-application"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSyncInterviewBlocksMutation } from "../../../mutations"
import {
  useApplicationGroupInterviewBlocksQuery,
  useApplicationPeriodGroupMatchingsQuery,
  useApplicationPeriodGroupsQuery,
} from "../../../queries"
import { useApplicationContext } from "../../provider"
import { CONFIRMED_MESSAGE } from "../../../components/Matching"
import { AvailabilityCalendarHeader } from "./components/AvailabilityCalendarHeader"
import { AvailabilityCalendar, type AvailabilitySlot } from "./components/AvailabilityCalendar"

const MATCHING_RUN_MESSAGE = "Matching-algoritmen har blitt kjørt, tilgjengeligheten kan ikke lenger endres"
const NO_PERMISSION_MESSAGE = "Du har ikke tilgang til å endre tilgjengeligheten for denne komitéen"

const AUTOSAVE_DELAY_MS = 800

export default function ApplicationGroupCalendarPage() {
  const { id, groupId } = useParams<{ id: string; groupId: string }>()
  const { application } = useApplicationContext()
  const { applicationGroups } = useApplicationPeriodGroupsQuery(application.id)
  const { interviewBlocks, isLoading, isSuccess } = useApplicationGroupInterviewBlocksQuery(groupId)
  const { groupMatchings } = useApplicationPeriodGroupMatchingsQuery(application.id)
  const { abbreviationBySlug } = useGroupAbbreviationMap()
  const syncInterviewBlocks = useSyncInterviewBlocksMutation()

  const { canManageApplicationInterviews, canEditApplicationGroupAvailability } = useAuthorization()

  const hasRunMatching = groupMatchings.some((matching) => matching.matchedApplicants > 0)
  const applicationGroup = applicationGroups.find((candidate) => candidate.id === groupId)
  const canEdit = applicationGroup !== undefined && canEditApplicationGroupAvailability(applicationGroup.groupId)

  const readOnlyReason =
    application.interviewsPublishedAt !== null
      ? CONFIRMED_MESSAGE
      : hasRunMatching
        ? MATCHING_RUN_MESSAGE
        : !canEdit
          ? NO_PERMISSION_MESSAGE
          : undefined

  const committeeName =
    applicationGroup === undefined
      ? null
      : (abbreviationBySlug.get(applicationGroup.groupId) ?? applicationGroup.groupId)

  useBreadcrumbLabel(
    breadcrumbPath("opptak", id, "tilgjengelighet", groupId),
    committeeName,
    breadcrumbPath("opptak", id, "tilgjengelighet")
  )

  const storedSlots = useMemo<AvailabilitySlot[]>(
    () =>
      interviewBlocks.map((block) => ({
        id: block.id,
        start: block.startsAt.toISOString(),
        end: block.endsAt.toISOString(),
        room: block.locationName,
        link: block.locationUrl ?? "",
      })),
    [interviewBlocks]
  )

  const [slots, setSlots] = useState<AvailabilitySlot[]>(storedSlots)
  const [interviewDuration, setInterviewDuration] = useState<CommitteeApplicationInterviewDuration>(
    applicationGroup?.interviewDuration ?? DEFAULT_COMMITTEE_APPLICATION_INTERVIEW_DURATION
  )
  const hydratedSlotsRef = useRef(storedSlots)
  const hydratedGroupRef = useRef(applicationGroup)

  const hasUnsavedChanges = useMemo(() => {
    if (applicationGroup !== undefined && applicationGroup.interviewDuration !== interviewDuration) {
      return true
    }

    if (slots.length !== storedSlots.length) {
      return true
    }

    const storedSlotsById = new Map(storedSlots.map((slot) => [slot.id, slot]))

    return slots.some((slot) => {
      const storedSlot = storedSlotsById.get(slot.id)

      return (
        storedSlot === undefined ||
        storedSlot.start !== slot.start ||
        storedSlot.end !== slot.end ||
        storedSlot.room !== slot.room ||
        storedSlot.link !== slot.link
      )
    })
  }, [slots, storedSlots, applicationGroup, interviewDuration])

  const isHydrated =
    isSuccess &&
    applicationGroup !== undefined &&
    hydratedGroupRef.current === applicationGroup &&
    hydratedSlotsRef.current === storedSlots
  const canAutosave = readOnlyReason === undefined && isHydrated
  const isPending = syncInterviewBlocks.isPending
  const saveRef = useRef(() => {})

  useEffect(() => {
    if (hydratedSlotsRef.current !== storedSlots) {
      hydratedSlotsRef.current = storedSlots
      setSlots(storedSlots)
    }
  }, [storedSlots])

  useEffect(() => {
    if (applicationGroup !== undefined && hydratedGroupRef.current !== applicationGroup) {
      hydratedGroupRef.current = applicationGroup
      setInterviewDuration(applicationGroup.interviewDuration)
    }
  }, [applicationGroup])

  useEffect(() => {
    saveRef.current = () => {
      if (!canAutosave || !hasUnsavedChanges || isPending) {
        return
      }

      syncInterviewBlocks.mutate({
        applicationGroupId: groupId,
        interviewDuration,
        interviewBlocks: slots.map((slot) => ({
          id: slot.id,
          startsAt: new Date(slot.start),
          endsAt: new Date(slot.end),
          locationName: slot.room.trim(),
          locationUrl: slot.link.trim() === "" ? null : slot.link.trim(),
        })),
      })
    }
  })

  useEffect(() => {
    if (!canAutosave || !hasUnsavedChanges || isPending) {
      return
    }

    const timeout = setTimeout(() => saveRef.current(), AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timeout)
  }, [canAutosave, hasUnsavedChanges, isPending])

  useEffect(() => {
    const flush = () => saveRef.current()
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") {
        flush()
      }
    }

    window.addEventListener("pagehide", flush)
    document.addEventListener("visibilitychange", flushWhenHidden)

    return () => {
      window.removeEventListener("pagehide", flush)
      document.removeEventListener("visibilitychange", flushWhenHidden)
      flush()
    }
  }, [])

  if (!canManageApplicationInterviews()) {
    return <NoAccessNotice />
  }

  if (isLoading || applicationGroup === undefined || committeeName === null) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <AvailabilityCalendarHeader
        committeeName={committeeName}
        interviewDuration={interviewDuration}
        isSaving={hasUnsavedChanges || isPending}
        readOnlyReason={readOnlyReason}
        onInterviewDurationChange={setInterviewDuration}
      />

      <AvailabilityCalendar
        startDate={application.interviewsStartDate}
        endDate={application.interviewsEndDate}
        interviewDuration={interviewDuration}
        selected={slots}
        onChange={setSlots}
      />
    </div>
  )
}
