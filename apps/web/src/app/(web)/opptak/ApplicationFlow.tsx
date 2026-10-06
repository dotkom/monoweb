"use client"

import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useTRPC } from "@/utils/trpc/client"
import { findActiveMembership } from "@dotkomonline/rpc/user"
import { Button, cn, Text, Textarea, Title, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { getStudyGrade } from "@dotkomonline/utils"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  COMMITTEE_APPLICATION_MAXIMUM_EXCLUSIVE_GROUPS,
  isInterviewAvailabilityValid,
  type CommitteeApplicationInterviewAvailability,
  type CommitteeApplicationOpenPeriod,
  type CommitteeApplication,
} from "@dotkomonline/rpc/committee-application"
import { CommitteeSelectionStep } from "./CommitteeSelectionStep"
import { InterviewAvailabilityStep } from "./InterviewAvailabilityStep"
import { formatInterviewAvailability } from "./interview-availability"

const stepTitles = ["Informasjon", "Velg komiteer", "Søknad", "Tilgjengelighet", "Rekkefølge", "Oppsummering"]
const studyYears = [1, 2, 3, 4, 5]
const maximumExclusiveGroups = COMMITTEE_APPLICATION_MAXIMUM_EXCLUSIVE_GROUPS

interface ApplicationFlowProps {
  applicationPeriod: CommitteeApplicationOpenPeriod
  application?: CommitteeApplication
}

export function ApplicationFlow({ applicationPeriod, application }: ApplicationFlowProps) {
  const { dbUser } = useAuthenticatedUser()
  const remoteProcedure = useTRPC()
  const router = useRouter()
  const submissionInProgress = useRef(false)
  const creation = useMutation(
    remoteProcedure.committeeApplication.submitApplication.mutationOptions({
      retry: false,
      onSuccess: () => {
        router.replace("/opptak/intervjuer")
        router.refresh()
      },
      onError: () => {
        submissionInProgress.current = false
      },
    })
  )
  const update = useMutation(
    remoteProcedure.committeeApplication.updateApplication.mutationOptions({
      retry: false,
      onSuccess: () => {
        router.replace("/opptak/intervjuer")
        router.refresh()
      },
      onError: () => {
        submissionInProgress.current = false
      },
    })
  )
  const submission = application === undefined ? creation : update
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    application?.groupSelections.map((selection) => selection.applicationGroupId) ?? []
  )
  const [selectedStudyYear, setSelectedStudyYear] = useState<number | null>(application?.studyYear ?? null)
  const [aboutMe, setAboutMe] = useState(application?.aboutMe ?? "")
  const [interviewAvailability, setInterviewAvailability] = useState<CommitteeApplicationInterviewAvailability[]>(
    application?.availabilityBlocks.map((availability) => ({
      startsAt: availability.startsAt,
      endsAt: availability.endsAt,
    })) ?? []
  )
  const membership = dbUser ? findActiveMembership(dbUser) : null
  const membershipStudyYear = membership?.semester != null ? getStudyGrade(membership.semester) : null
  const defaultStudyYear =
    membershipStudyYear !== null && studyYears.includes(membershipStudyYear) ? membershipStudyYear : null
  const studyYear = selectedStudyYear ?? defaultStudyYear

  useEffect(() => {
    document.title = `${stepTitles[stepIndex]} | Komitéopptak | Online`
    document.getElementById("application-step-title")?.focus()
  }, [stepIndex])

  const selectedGroups = selectedGroupIds.flatMap((groupId) => {
    const group = applicationPeriod.groups.find((applicationGroup) => applicationGroup.id === groupId)

    if (group === undefined) {
      return []
    }

    return [group]
  })
  const selectedExclusiveGroups = selectedGroups.filter((group) => group.type === "EXCLUSIVE")
  const selectedAdditiveGroups = selectedGroups.filter((group) => group.type === "ADDITIVE")

  let canContinue = true

  if (stepIndex === 1) {
    canContinue = selectedGroups.length > 0 && selectedExclusiveGroups.length <= maximumExclusiveGroups
  }

  if (stepIndex === 2) {
    canContinue = studyYear !== null && aboutMe.trim().length > 0
  }

  if (stepIndex === 3) {
    canContinue =
      interviewAvailability.length > 0 &&
      interviewAvailability.every((availability) => isInterviewAvailabilityValid(availability, applicationPeriod))
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
      const exclusiveGroupIds = currentGroupIds.filter((currentGroupId) =>
        applicationPeriod.groups.some((group) => group.id === currentGroupId && group.type === "EXCLUSIVE")
      )
      const currentIndex = exclusiveGroupIds.indexOf(groupId)
      const targetIndex = currentIndex + direction

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= exclusiveGroupIds.length) {
        return currentGroupIds
      }

      const reorderedGroupIds = [...currentGroupIds]
      const targetGroupId = exclusiveGroupIds[targetIndex]
      reorderedGroupIds[currentGroupIds.indexOf(groupId)] = targetGroupId
      reorderedGroupIds[currentGroupIds.indexOf(targetGroupId)] = groupId
      return reorderedGroupIds
    })
  }

  let nextButtonText = "Neste"

  if (stepIndex === stepTitles.length - 1) {
    nextButtonText = application === undefined ? "Send søknad" : "Lagre endringer"
    canContinue =
      dbUser !== null &&
      studyYear !== null &&
      aboutMe.trim().length > 0 &&
      selectedGroups.length > 0 &&
      interviewAvailability.length > 0
  }

  if (submission.isPending || submission.isSuccess) {
    nextButtonText = "Sender søknaden…"
  }

  return (
    <div className={cn("mx-auto flex w-full flex-col gap-8 py-8", stepIndex === 3 ? "max-w-4xl" : "max-w-2xl")}>
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
        noValidate={stepIndex === 3}
        onSubmit={(event) => {
          event.preventDefault()

          if (!canContinue || submissionInProgress.current) {
            return
          }

          if (stepIndex === stepTitles.length - 1) {
            if (studyYear === null || dbUser === null) {
              return
            }

            submissionInProgress.current = true
            const applicationData = {
              aboutMe,
              studyYear,
              groupSelections: [
                ...selectedExclusiveGroups.map((group, groupIndex) => ({
                  applicationGroupId: group.id,
                  rank: groupIndex + 1,
                })),
                ...selectedAdditiveGroups.map((group) => ({ applicationGroupId: group.id, rank: null })),
              ],
              interviewAvailability,
            }
            if (application === undefined) {
              creation.mutate({ ...applicationData, applicationPeriodId: applicationPeriod.id })
            } else {
              update.mutate({ applicationId: application.id, application: applicationData })
            }
            return
          }

          setStepIndex((currentStepIndex) => currentStepIndex + 1)
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

          {stepIndex === 3 && (
            <InterviewAvailabilityStep
              applicationPeriod={applicationPeriod}
              availability={interviewAvailability}
              onAvailabilityChange={setInterviewAvailability}
            />
          )}

          {stepIndex === 4 && (
            <div className="flex flex-col gap-4">
              {selectedExclusiveGroups.length > 0 && <Text>Sett komiteen du helst vil bli med i øverst.</Text>}
              {selectedExclusiveGroups.length === 0 && (
                <Text>Du har bare valgt grupper uten prioritering. Gå videre for å se oppsummeringen.</Text>
              )}
              <ol className="flex flex-col gap-3">
                {selectedExclusiveGroups.map((group, groupIndex) => (
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
                        disabled={groupIndex === selectedExclusiveGroups.length - 1}
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
              {selectedExclusiveGroups.length > 0 && (
                <section className="flex flex-col gap-2">
                  <Title element="h2" size="sm">
                    Komiteer i prioritert rekkefølge
                  </Title>
                  <ol className="list-inside list-decimal space-y-1">
                    {selectedExclusiveGroups.map((group) => (
                      <li key={group.id}>{group.name}</li>
                    ))}
                  </ol>
                </section>
              )}
              {selectedAdditiveGroups.length > 0 && (
                <section className="flex flex-col gap-2">
                  <Title element="h2" size="sm">
                    Andre grupper
                  </Title>
                  <ul className="space-y-1">
                    {selectedAdditiveGroups.map((group) => (
                      <li key={group.id}>{group.name}</li>
                    ))}
                  </ul>
                </section>
              )}
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
                <Text className="text-sm text-gray-600 dark:text-stone-400">Alle tider er i norsk tid.</Text>
                <ul className="space-y-1">
                  {interviewAvailability.map((availability) => (
                    <li key={availability.startsAt.toISOString()}>{formatInterviewAvailability(availability)}</li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>

        {stepIndex === stepTitles.length - 1 && dbUser === null && (
          <Text role="alert">Du må være logget inn med en Online-bruker for å sende søknaden.</Text>
        )}
        {submission.isError && (
          <Text role="alert" className="text-red-700 dark:text-red-400">
            Søknaden ble ikke sendt inn. {submission.error.message} Prøv igjen.
          </Text>
        )}

        <footer className="flex items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-stone-700">
          <div>
            {stepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={submission.isPending || submission.isSuccess}
                onClick={() => setStepIndex((currentStepIndex) => currentStepIndex - 1)}
              >
                Tilbake
              </Button>
            )}
          </div>
          <Button
            type="submit"
            variant="default"
            disabled={!canContinue || submission.isPending || submission.isSuccess}
          >
            {nextButtonText}
          </Button>
        </footer>
      </form>
    </div>
  )
}
