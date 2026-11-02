import type { CommitteeApplicationOpenPeriod } from "@dotkomonline/rpc/committee-application"
import { Text, Title, cn } from "@dotkomonline/ui"
import { useEffect, useRef, useState } from "react"
import { IconCircles, IconDiamond } from "@tabler/icons-react"
import { GroupSelectionCard } from "./GroupSelectionCard"

type ApplicationGroup = CommitteeApplicationOpenPeriod["groups"][number]

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
  const isExclusiveLimitReached = selectedExclusiveGroupCount >= maximumExclusiveGroups
  const hasAdditiveGroups = additiveGroups.length > 0
  const hasExclusiveGroups = exclusiveGroups.length > 0
  const exclusiveListRef = useRef<HTMLFieldSetElement>(null)
  const [isExclusiveListVisible, setIsExclusiveListVisible] = useState(true)

  useEffect(() => {
    const exclusiveList = exclusiveListRef.current

    if (!hasExclusiveGroups || exclusiveList === null) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]

      if (entry !== undefined) {
        setIsExclusiveListVisible(entry.isIntersecting)
      }
    })
    observer.observe(exclusiveList)

    return () => {
      observer.disconnect()
    }
  }, [hasExclusiveGroups])

  return (
    <div className="flex flex-col gap-8 sm:gap-12">
      <section className="rounded-2xl border border-border/50 bg-muted/40 p-5 sm:p-6">
        <Title element="h2" size="sm" className="mb-2">
          Hvilke grupper har du lyst til å være med i?
        </Title>
        <Text className="text-sm leading-relaxed text-muted-foreground">
          Ta en titt på alle gruppene og velg dem du vil søke på. Du kan bli tatt opp i maksimalt én enten-eller-gruppe
          og flere både-og-grupper. Les mer for å bli bedre kjent med hver gruppe.
        </Text>
      </section>
      {exclusiveGroups.length > 0 && (
        <fieldset
          ref={exclusiveListRef}
          aria-describedby="exclusive-groups-description"
          className="flex min-w-0 flex-col gap-3 sm:gap-4"
        >
          <Title element="legend" size="md">
            <span className="inline-flex items-center gap-2">
              <IconDiamond className="size-5 shrink-0 text-blue-600 dark:text-blue-300" aria-hidden="true" />
              Enten-eller
            </span>
          </Title>

          <Text id="exclusive-groups-description" className="text-sm text-gray-600 dark:text-stone-400">
            Søk på opptil {maximumExclusiveGroups} grupper. Du kan få tilbud om plass i hvilken som helst av dem, men
            bare bli tatt opp i én.
          </Text>

          <div className="flex flex-wrap gap-3">
            {exclusiveGroups.map((group) => (
              <GroupSelectionCard
                key={group.id}
                group={group}
                checked={selectedGroupIds.includes(group.id)}
                disabled={isExclusiveLimitReached && !selectedGroupIds.includes(group.id)}
                onSelectionChange={onSelectionChange}
              />
            ))}
          </div>
        </fieldset>
      )}

      {additiveGroups.length > 0 && (
        <fieldset aria-describedby="additive-groups-description" className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <Title element="legend" size="md">
            <span className="inline-flex items-center gap-2">
              <IconCircles className="size-5 shrink-0 text-violet-600 dark:text-violet-300" aria-hidden="true" />
              Både-og
            </span>
          </Title>

          <Text id="additive-groups-description" className="text-sm text-gray-600 dark:text-stone-400">
            Søk på så mange du vil. Du kan bli tatt opp i flere av disse, også i tillegg til en enten-eller-gruppe.
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
      {isExclusiveLimitReached && (
        <aside
          role="status"
          aria-hidden={!isExclusiveListVisible}
          inert={!isExclusiveListVisible}
          className={cn(
            "sticky bottom-24 z-31 mx-auto w-fit max-w-full rounded-xl border border-border bg-card px-4 py-3 text-card-foreground shadow-md motion-safe:transition-opacity motion-safe:duration-200",
            isExclusiveListVisible ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <Text className="text-sm font-medium">
            Du kan bare velge {maximumExclusiveGroups}{" "}
            <span className="ml-0.5 inline-flex items-center gap-1 align-bottom">
              <IconDiamond className="size-4 text-blue-600 dark:text-blue-300" aria-hidden="true" />
              enten-eller-grupper
            </span>
          </Text>
          {hasAdditiveGroups && (
            <Text className="text-sm text-muted-foreground">Du kan fortsatt velge både-og-grupper.</Text>
          )}
        </aside>
      )}
    </div>
  )
}
