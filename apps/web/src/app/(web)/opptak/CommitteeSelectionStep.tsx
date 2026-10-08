import type { CommitteeApplicationPeriodSummary } from "@dotkomonline/rpc/committee-application"
import { Text, Title } from "@dotkomonline/ui"
import { useState } from "react"
import { GroupSelectionCard } from "./GroupSelectionCard"

type ApplicationGroup = CommitteeApplicationPeriodSummary["groups"][number]

interface CommitteeSelectionStepProps {
  groups: ApplicationGroup[]
  selectedGroupIds: string[]
  maximumExclusiveGroups: number
  onSelectionChange: (groupId: string, checked: boolean) => void
}

export function CommitteeSelectionStep({
  groups,
  selectedGroupIds,
  maximumExclusiveGroups,
  onSelectionChange,
}: CommitteeSelectionStepProps) {
  const [shuffledGroups] = useState(() => {
    const shuffled = [...groups]

    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1))
      const group = shuffled[index]
      shuffled[index] = shuffled[randomIndex]
      shuffled[randomIndex] = group
    }

    return shuffled
  })
  const exclusiveGroups = shuffledGroups.filter((group) => group.type === "EXCLUSIVE")
  const additiveGroups = shuffledGroups.filter((group) => group.type === "ADDITIVE")
  const selectedExclusiveGroupCount = exclusiveGroups.filter((group) => selectedGroupIds.includes(group.id)).length
  const exclusiveLimitReached = selectedExclusiveGroupCount >= maximumExclusiveGroups

  return (
    <div className="flex flex-col gap-8 sm:gap-12">
      <Text>Velg komiteene og gruppene du ønsker å søke på.</Text>

      {exclusiveGroups.length > 0 && (
        <fieldset aria-describedby="exclusive-groups-description" className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <Title element="legend" size="md" className="mb-2">
            Komiteer
          </Title>
          <Text id="exclusive-groups-description" className="text-sm text-gray-600 dark:text-stone-400">
            Du kan søke på opptil {maximumExclusiveGroups} komiteer. Du kan bli tatt opp i én av disse.
          </Text>
          {exclusiveLimitReached && (
            <Text role="status" className="text-sm font-medium">
              Du har valgt maksimalt antall komiteer. Fjern et valg for å velge en annen komité.
            </Text>
          )}
          <div className="flex flex-wrap gap-3">
            {exclusiveGroups.map((group) => (
              <GroupSelectionCard
                key={group.id}
                group={group}
                checked={selectedGroupIds.includes(group.id)}
                disabled={exclusiveLimitReached && !selectedGroupIds.includes(group.id)}
                onSelectionChange={onSelectionChange}
              />
            ))}
          </div>
        </fieldset>
      )}

      {additiveGroups.length > 0 && (
        <fieldset aria-describedby="additive-groups-description" className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <Title element="legend" size="md" className="mb-2">
            Andre grupper
          </Title>
          <Text id="additive-groups-description" className="text-sm text-gray-600 dark:text-stone-400">
            Velg så mange du vil. Disse kommer i tillegg til komitévalgene dine, og du kan bli tatt opp i flere.
          </Text>
          <div className="flex flex-wrap gap-3">
            {additiveGroups.map((group) => (
              <GroupSelectionCard
                key={group.id}
                group={group}
                checked={selectedGroupIds.includes(group.id)}
                onSelectionChange={onSelectionChange}
              />
            ))}
          </div>
        </fieldset>
      )}

      <Text id="group-selection-requirement" className="text-sm text-gray-600 dark:text-stone-400">
        Velg minst én komité eller gruppe for å gå videre.
      </Text>
    </div>
  )
}
