"use client"

import { INTERVIEW_SLOT_COLORS } from "../../../../components/Calendar/slot-layout"
import type { CommitteeApplicationMatchedInterview } from "@dotkomonline/rpc/committee-application"
import { Button, Title } from "@dotkomonline/ui"
import { formatDate } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { InterviewSlot, useExpandedInterview } from "./InterviewCalendar"

const POPUP_WIDTH = 432
const VIEWPORT_MARGIN = 16

const formatTimeText = (interview: CommitteeApplicationMatchedInterview) =>
  `${formatDate(interview.startsAt, "HH:mm")} - ${formatDate(interview.endsAt, "HH:mm")}`

interface MyInterviewsProps {
  interviews: CommitteeApplicationMatchedInterview[]
  canAttend: boolean
  onRemoveInterview: (applicationId: string) => void
}

export const MyInterviews = ({ interviews, canAttend, onRemoveInterview }: MyInterviewsProps) => {
  const router = useRouter()
  const { id, groupId } = useParams<{ id: string; groupId: string }>()
  const { expandedId, toggleExpanded } = useExpandedInterview()
  const [alignsToEnd, setAlignsToEnd] = useState(false)

  const orderedInterviews = useMemo(
    () => [...interviews].sort((first, second) => first.startsAt.getTime() - second.startsAt.getTime()),
    [interviews]
  )

  if (interviews.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <Title element="h3" className="text-lg">
        Dine intervjuer
      </Title>

      <div className="flex flex-wrap items-center gap-3">
        {orderedInterviews.map((interview) => (
          <div
            key={interview.applicationId}
            className="relative h-14 w-72 shrink-0 rounded-[4px]"
            style={{
              backgroundColor: INTERVIEW_SLOT_COLORS.own.surface,
              color: INTERVIEW_SLOT_COLORS.own.text,
            }}
          >
            <InterviewSlot
              interview={interview}
              timeText={formatTimeText(interview)}
              isActive={interview.applicationId === expandedId}
              isAdded
              canAttend={canAttend}
              placement="bottom"
              alignsToEnd={alignsToEnd}
              onRemove={() => onRemoveInterview(interview.applicationId)}
              onOpenApplicant={() =>
                router.push(`/admin/opptak/${id}/opplysninger/${groupId}/${interview.applicationId}`)
              }
            />

            <Button
              variant="unstyled"
              aria-label={`Vis detaljer for intervju med ${interview.name}`}
              className="absolute inset-0 z-10 cursor-pointer rounded-[4px]"
              onClick={(event) => {
                const slot = event.currentTarget.getBoundingClientRect()

                setAlignsToEnd(slot.left + POPUP_WIDTH > window.innerWidth - VIEWPORT_MARGIN)
                toggleExpanded(interview.applicationId)
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
