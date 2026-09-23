"use client"

import { SaveStatus } from "@admin/components/SaveStatus"
import {
  COMMITTEE_APPLICATION_INTERVIEW_DURATION_MINUTES,
  type CommitteeApplicationInterviewDuration,
} from "@dotkomonline/rpc/committee-application"
import { Text, Title, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { IconClock, IconLock } from "@tabler/icons-react"

const INTERVIEW_DURATIONS: CommitteeApplicationInterviewDuration[] = ["MINUTES_30", "MINUTES_20"]

type AvailabilityCalendarHeaderProps = {
  committeeName: string
  interviewDuration: CommitteeApplicationInterviewDuration
  isSaving: boolean
  readOnlyReason?: string
  onInterviewDurationChange: (interviewDuration: CommitteeApplicationInterviewDuration) => void
}

export function AvailabilityCalendarHeader({
  committeeName,
  interviewDuration,
  isSaving,
  readOnlyReason,
  onInterviewDurationChange,
}: AvailabilityCalendarHeaderProps) {
  const interviewMinutes = COMMITTEE_APPLICATION_INTERVIEW_DURATION_MINUTES[interviewDuration]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1">
          <Title element="h2" className="text-2xl">
            Tilgjengelighet for {committeeName}
          </Title>
        </div>

        {readOnlyReason === undefined ? (
          <SaveStatus
            isSaving={isSaving}
            labels={{ saving: "Lagrer...", saved: "Alle endringene er lagret!" }}
            savingClassName="text-red-600 dark:text-red-400"
            savedClassName="text-green-600 dark:text-green-400"
          />
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <IconLock size={16} />
            <Text className="text-sm">{readOnlyReason}</Text>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-lg border border-input px-4 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <IconClock className="mt-0.5 size-5 shrink-0 text-muted-foreground" stroke={1.75} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text element="span" className="text-sm font-medium">
              Lengde per intervju
            </Text>
            <Text element="span" className="text-sm text-muted-foreground">
              Antall minutter per intervju:{" "}
              <Text element="span" className="font-bold text-primary dark:text-blue-300">
                {interviewMinutes}
              </Text>{" "}
              minutter
            </Text>
          </div>
        </div>

        <ToggleGroup
          className="h-9 shrink-0"
          multiple={false}
          spacing={0}
          value={[interviewDuration]}
          onValueChange={(value) => {
            const next = value.at(0)

            if (next !== undefined && INTERVIEW_DURATIONS.includes(next as CommitteeApplicationInterviewDuration)) {
              onInterviewDurationChange(next as CommitteeApplicationInterviewDuration)
            }
          }}
        >
          {INTERVIEW_DURATIONS.map((duration) => (
            <ToggleGroupItem key={duration} value={duration} className="h-full border-input px-4">
              <Text element="span">{COMMITTEE_APPLICATION_INTERVIEW_DURATION_MINUTES[duration]} min</Text>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}
