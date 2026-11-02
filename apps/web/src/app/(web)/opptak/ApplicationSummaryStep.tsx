import type {
  CommitteeApplicationOpenPeriod,
  CommitteeApplicationInterviewAvailability,
} from "@dotkomonline/rpc/committee-application"
import { Text, Title } from "@dotkomonline/ui"
import { GroupLogo } from "@/components/atoms/GroupLogo"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { AvailableInterviewTime } from "./AvailableInterviewTime"
import { getAvailableInterviewHours, formatInterviewAvailability } from "./interview-availability"
import { capitalizeFirstLetter } from "@dotkomonline/utils/text"

interface ApplicationSummaryStepProps {
  selectedExclusiveGroups: CommitteeApplicationOpenPeriod["groups"]
  selectedAdditiveGroups: CommitteeApplicationOpenPeriod["groups"]
  studyYear: number | null
  aboutMe: string
  interviewAvailability: CommitteeApplicationInterviewAvailability[]
}

export function ApplicationSummaryStep({
  selectedExclusiveGroups,
  selectedAdditiveGroups,
  studyYear,
  aboutMe,
  interviewAvailability,
}: ApplicationSummaryStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-border/50 bg-muted/40 p-5 sm:p-6">
        <Title element="h2" size="sm" className="mb-2">
          Ser alt riktig ut?
        </Title>
        <Text className="text-sm leading-relaxed text-muted-foreground">
          Se over valgene dine før du sender inn. Du kan gå tilbake hvis du vil endre noe.
        </Text>
      </section>
      {selectedExclusiveGroups.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
          <Title element="h2" size="sm">
            Enten-eller-grupper
          </Title>
          <Text className="text-sm leading-relaxed text-muted-foreground">
            Du kan få tilbud om plass i hvilken som helst av disse gruppene, men bare bli tatt opp i én av dem.
          </Text>
          <ul className="space-y-2" aria-label="Valgte enten-eller-grupper">
            {selectedExclusiveGroups.map((group) => (
              <SummaryGroup key={group.id} group={group} />
            ))}
          </ul>
        </section>
      )}
      {selectedAdditiveGroups.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
          <Title element="h2" size="sm">
            Både-og-grupper
          </Title>
          <Text className="text-sm leading-relaxed text-muted-foreground">
            Du kan få tilbud om plass i flere av disse gruppene. Her er det ingen grense på én gruppe.
          </Text>
          <ul className="space-y-2">
            {selectedAdditiveGroups.map((group) => (
              <SummaryGroup key={group.id} group={group} />
            ))}
          </ul>
        </section>
      )}
      <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <Title element="h2" size="sm">
          Årstrinn
        </Title>
        <Text>{studyYear}. år</Text>
      </section>
      <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <Title element="h2" size="sm">
          Om deg
        </Title>
        <Text className="rounded-xl border border-border/60 bg-muted/50 p-4 whitespace-pre-wrap break-words leading-relaxed">
          {aboutMe}
        </Text>
      </section>
      <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
        <Title element="h2" size="sm">
          Tilgjengelighet for intervju
        </Title>
        <AvailableInterviewTime hours={getAvailableInterviewHours(interviewAvailability)} />
        <Text className="text-sm text-muted-foreground">
          Dette er tidene du kan møte, etter at tidene du ikke kan er trukket fra.
        </Text>
        <ul className="space-y-2">
          {interviewAvailability.map((availability) => (
            <Text
              element="li"
              key={availability.startsAt.toISOString()}
              className="rounded-xl bg-muted/50 px-3 py-2.5 text-sm tabular-nums"
            >
              {capitalizeFirstLetter(formatInterviewAvailability(availability))}
            </Text>
          ))}
        </ul>
      </section>
    </div>
  )
}

function SummaryGroup({ group }: { group: CommitteeApplicationOpenPeriod["groups"][number] }) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
      {group.imageUrl !== null && group.imageUrl !== "" ? (
        <GroupLogo
          src={group.imageUrl}
          alt={group.name}
          width={40}
          height={40}
          className="size-full"
          containerClassName="size-10 rounded-full p-1"
        />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted" aria-hidden="true">
          <OnlineIcon size={28} />
        </span>
      )}
      <Text className="min-w-0 break-words text-sm font-medium">{group.name}</Text>
    </li>
  )
}
