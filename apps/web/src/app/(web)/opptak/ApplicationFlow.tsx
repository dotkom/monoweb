"use client"

import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { findActiveMembership } from "@dotkomonline/rpc/user"
import { Button, Text, Textarea, Title, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { getStudyGrade } from "@dotkomonline/utils"
import { useEffect, useState } from "react"
import type { CommitteeApplicationPeriodSummary } from "@dotkomonline/rpc/committee-application"
import { CommitteeSelectionStep } from "./CommitteeSelectionStep"

const stepTitles = ["Informasjon", "Velg komiteer", "Søknad", "Tilgjengelighet", "Rekkefølge", "Oppsummering"]
const studyYears = [1, 2, 3, 4, 5]
const maximumExclusiveGroups = 3

interface ApplicationFlowProps {
  applicationPeriod: CommitteeApplicationPeriodSummary
}

export function ApplicationFlow({ applicationPeriod }: ApplicationFlowProps) {
  const { dbUser } = useAuthenticatedUser()
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [selectedStudyYear, setSelectedStudyYear] = useState<number | null>(null)
  const [aboutMe, setAboutMe] = useState("")
  const membership = dbUser ? findActiveMembership(dbUser) : null
  const membershipStudyYear = membership?.semester != null ? getStudyGrade(membership.semester) : null
  const defaultStudyYear =
    membershipStudyYear !== null && studyYears.includes(membershipStudyYear) ? membershipStudyYear : null
  const studyYear = selectedStudyYear ?? defaultStudyYear

  useEffect(() => {
    document.title = `${stepTitles[stepIndex] ?? "Takk for søknaden"} | Komitéopptak | Online`
    document.getElementById("application-step-title")?.focus()
  }, [stepIndex])

  const selectedGroups = selectedGroupIds.flatMap((groupId) => {
    const group = applicationPeriod.groups.find((applicationGroup) => applicationGroup.id === groupId)

    if (group === undefined) {
      return []
    }

    return [group]
  })

  let canContinue = true

  if (stepIndex === 1) {
    const selectedExclusiveGroups = selectedGroups.filter((group) => group.type === "EXCLUSIVE")
    canContinue = selectedGroups.length > 0 && selectedExclusiveGroups.length <= maximumExclusiveGroups
  }

  if (stepIndex === 2) {
    canContinue = studyYear !== null && aboutMe.trim().length > 0
  }

  function toggleGroup(groupId: string, checked: boolean) {
    setSelectedGroupIds((currentGroupIds) => {
      if (checked) {
        const group = applicationPeriod.groups.find((applicationGroup) => applicationGroup.id === groupId)

        if (group === undefined || currentGroupIds.includes(groupId)) {
          return currentGroupIds
        }

        const selectedExclusiveGroupCount = applicationPeriod.groups.filter(
          (applicationGroup) => applicationGroup.type === "EXCLUSIVE" && currentGroupIds.includes(applicationGroup.id)
        ).length

        if (group.type === "EXCLUSIVE" && selectedExclusiveGroupCount >= maximumExclusiveGroups) {
          return currentGroupIds
        }

        return [...currentGroupIds, groupId]
      }

      return currentGroupIds.filter((currentGroupId) => currentGroupId !== groupId)
    })
  }

  function moveGroup(groupId: string, direction: number) {
    setSelectedGroupIds((currentGroupIds) => {
      const currentIndex = currentGroupIds.indexOf(groupId)
      const targetIndex = currentIndex + direction

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= currentGroupIds.length) {
        return currentGroupIds
      }

      const reorderedGroupIds = [...currentGroupIds]
      const [movedGroupId] = reorderedGroupIds.splice(currentIndex, 1)
      reorderedGroupIds.splice(targetIndex, 0, movedGroupId)
      return reorderedGroupIds
    })
  }

  if (stepIndex === stepTitles.length) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-8">
        <Title element="h1" size="xl" id="application-step-title" tabIndex={-1} className="outline-none">
          Takk for søknaden
        </Title>
        <Text>Du har fullført forhåndsvisningen av søknadsflyten. Søknaden er ikke sendt inn.</Text>
      </div>
    )
  }

  let nextButtonText = "Neste"

  if (stepIndex === stepTitles.length - 1) {
    nextButtonText = "Fullfør forhåndsvisning"
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-8">
      <header className="flex flex-col gap-3">
        <Text className="text-sm text-gray-600 dark:text-stone-400">{applicationPeriod.name}</Text>
        <Text className="text-sm text-gray-600 dark:text-stone-400">
          Steg {stepIndex + 1} av {stepTitles.length}
        </Text>
        <Title element="h1" size="xl" id="application-step-title" tabIndex={-1} className="outline-none">
          {stepTitles[stepIndex]}
        </Title>
      </header>

      <form
        className="flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault()

          if (canContinue) {
            setStepIndex((currentStepIndex) => currentStepIndex + 1)
          }
        }}
      >
        <div className="min-h-56">
          {stepIndex === 0 && <Text>Her kan du søke om å bli med i en av Onlines komiteer.</Text>}

          {stepIndex === 1 && (
            <CommitteeSelectionStep
              groups={applicationPeriod.groups}
              selectedGroupIds={selectedGroupIds}
              maximumExclusiveGroups={maximumExclusiveGroups}
              onSelectionChange={toggleGroup}
            />
          )}

          {stepIndex === 2 && (
            <div className="flex flex-col gap-6">
              <fieldset>
                <Title element="legend" size="sm" id="study-year-label" className="mb-3">
                  Hvilket år går du på?
                </Title>
                <ToggleGroup
                  aria-labelledby="study-year-label"
                  variant="outline"
                  spacing={0}
                  multiple={false}
                  value={studyYear === null ? [] : [String(studyYear)]}
                  onValueChange={(values) => {
                    const value = values.at(0)
                    if (value !== undefined) {
                      setSelectedStudyYear(Number(value))
                    }
                  }}
                >
                  {studyYears.map((year) => (
                    <ToggleGroupItem key={year} type="button" value={String(year)} aria-label={`${year}. år`}>
                      {year}. år
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </fieldset>
              <Textarea
                id="about-me"
                name="aboutMe"
                label="Skriv kort om deg selv"
                value={aboutMe}
                onChange={(event) => setAboutMe(event.target.value)}
                rows={7}
                required
              />
            </div>
          )}

          {/* Step 3 is reserved for the interview availability calendar. */}

          {stepIndex === 4 && (
            <div className="flex flex-col gap-4">
              <Text>Sett komiteen du helst vil bli med i øverst.</Text>
              <ol className="flex flex-col gap-3">
                {selectedGroups.map((group, groupIndex) => (
                  <li
                    key={group.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-stone-700"
                  >
                    <Text>
                      {groupIndex + 1}. {group.name}
                    </Text>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Flytt ${group.name} opp`}
                        disabled={groupIndex === 0}
                        onClick={() => moveGroup(group.id, -1)}
                      >
                        Opp
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Flytt ${group.name} ned`}
                        disabled={groupIndex === selectedGroups.length - 1}
                        onClick={() => moveGroup(group.id, 1)}
                      >
                        Ned
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {stepIndex === 5 && (
            <div className="flex flex-col gap-6">
              <section className="flex flex-col gap-2">
                <Title element="h2" size="sm">
                  Komiteer i prioritert rekkefølge
                </Title>
                <ol className="list-inside list-decimal space-y-1">
                  {selectedGroups.map((group) => (
                    <li key={group.id}>{group.name}</li>
                  ))}
                </ol>
              </section>
              <section className="flex flex-col gap-2">
                <Title element="h2" size="sm">
                  Årstrinn
                </Title>
                <Text>{studyYear}. år</Text>
              </section>
              <section className="flex flex-col gap-2">
                <Title element="h2" size="sm">
                  Om deg
                </Title>
                <Text className="whitespace-pre-wrap break-words">{aboutMe}</Text>
              </section>
              <section className="flex flex-col gap-2">
                <Title element="h2" size="sm">
                  Tilgjengelighet for intervju
                </Title>
                <Text>Ingen tidspunkt valgt ennå.</Text>
              </section>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-stone-700">
          <div>
            {stepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStepIndex((currentStepIndex) => currentStepIndex - 1)}
              >
                Tilbake
              </Button>
            )}
          </div>
          <Button type="submit" variant="default" disabled={!canContinue}>
            {nextButtonText}
          </Button>
        </footer>
      </form>
    </div>
  )
}
