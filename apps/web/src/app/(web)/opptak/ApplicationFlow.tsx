"use client"

import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useTRPC } from "@/utils/trpc/client"
import { findActiveMembership } from "@dotkomonline/rpc/user"
import { Button, cn, Text, Timeline, TimelineDot, TimelineItem, Title } from "@dotkomonline/ui"
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
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconArrowDown } from "@tabler/icons-react"
import styles from "./ApplicationFlow.module.css"
import { ApplicationInformationStep } from "./ApplicationInformationStep"
import { ApplicationDetailsStep, studyYears } from "./ApplicationDetailsStep"
import { GroupRankingStep } from "./GroupRankingStep"
import { ApplicationSummaryStep } from "./ApplicationSummaryStep"
import { SelectedGroupsMenu } from "./SelectedGroupsMenu"
import { ScrollHint, type ScrollHintHandle } from "./ScrollHint"
import { getApplicationInterviewWindows, subtractInterviewIntervals } from "./interview-availability"

const stepTitles = ["Informasjon", "Velg grupper", "Søknad", "Tilgjengelighet", "Rekkefølge", "Oppsummering"]
const maximumExclusiveGroups = COMMITTEE_APPLICATION_MAXIMUM_EXCLUSIVE_GROUPS

interface ApplicationFlowProps {
  applicationPeriod: CommitteeApplicationOpenPeriod
  application?: CommitteeApplication
}

export function ApplicationFlow({ applicationPeriod, application }: ApplicationFlowProps) {
  const { dbUser } = useAuthenticatedUser()
  const remoteProcedure = useTRPC()
  const router = useRouter()
  const applicationStepContent = useRef<HTMLDivElement>(null)
  const applicationFooter = useRef<HTMLElement>(null)
  const scrollHint = useRef<ScrollHintHandle>(null)
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
  const [isAtGroupSelectionEnd, setIsAtGroupSelectionEnd] = useState(false)
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    application?.groupSelections.map((selection) => selection.applicationGroupId) ?? []
  )
  const [selectedStudyYear, setSelectedStudyYear] = useState<number | null>(application?.studyYear ?? null)
  const [aboutMe, setAboutMe] = useState(application?.aboutMe ?? "")
  const interviewWindows = getApplicationInterviewWindows(applicationPeriod)
  const [unavailability, setUnavailability] = useState<CommitteeApplicationInterviewAvailability[]>(() => {
    if (application === undefined) {
      return []
    }

    return subtractInterviewIntervals(interviewWindows, application.availabilityBlocks)
  })
  const interviewAvailability = subtractInterviewIntervals(interviewWindows, unavailability)
  const membership = dbUser ? findActiveMembership(dbUser) : null
  const membershipStudyYear = membership?.semester != null ? getStudyGrade(membership.semester) : null
  const defaultStudyYear =
    membershipStudyYear !== null && studyYears.includes(membershipStudyYear) ? membershipStudyYear : null
  const studyYear = selectedStudyYear ?? defaultStudyYear

  useEffect(() => {
    document.title = `${stepTitles[stepIndex]} | Komitéopptak | Online`
    document.getElementById("application-step-title")?.focus()
  }, [stepIndex])

  useEffect(() => {
    const content = applicationStepContent.current
    const footer = applicationFooter.current

    if (stepIndex !== 1 || content === null || footer === null) {
      return
    }

    const updateGroupSelectionEnd = () => {
      setIsAtGroupSelectionEnd(content.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top)
    }

    updateGroupSelectionEnd()

    const resizeObserver = new ResizeObserver(updateGroupSelectionEnd)
    resizeObserver.observe(content)
    resizeObserver.observe(footer)
    window.addEventListener("scroll", updateGroupSelectionEnd, { passive: true })
    window.addEventListener("resize", updateGroupSelectionEnd)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("scroll", updateGroupSelectionEnd)
      window.removeEventListener("resize", updateGroupSelectionEnd)
    }
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
    canContinue =
      isAtGroupSelectionEnd && selectedGroups.length > 0 && selectedExclusiveGroups.length <= maximumExclusiveGroups
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
  const isScrollRequired = stepIndex === 1 && !isAtGroupSelectionEnd

  function showScrollHint() {
    scrollHint.current?.show()
  }

  if (isScrollRequired && selectedGroups.length > 0) {
    nextButtonText = "Bla til bunnen"
  }

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
    <div
      className={cn(
        styles["committee-application-flow"],
        "mx-auto flex w-full flex-col gap-2",
        stepIndex === 3 ? "max-w-4xl" : "max-w-2xl"
      )}
    >
      {stepIndex > 0 && (
        <Text className="text-xs text-muted-foreground motion-safe:transition-opacity motion-safe:duration-300 motion-safe:starting:opacity-0">
          {applicationPeriod.name}
        </Text>
      )}

      <header className="sticky top-[calc(var(--navbar-height)+(--spacing(8)))] z-40 flex flex-col gap-2 pb-2 mb-2 bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[calc(var(--navbar-height)+(--spacing(8)))] bg-background"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-background"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-full left-1/2 h-6 w-screen -translate-x-1/2 bg-linear-to-b from-background to-transparent"
        />

        <Timeline
          orientation="horizontal"
          role="list"
          aria-label="Søknadssteg"
          color="gray"
          className="min-w-0 grid-cols-6 overflow-x-visible"
        >
          {stepTitles.map((stepTitle, timelineStepIndex) => (
            <TimelineItem
              key={stepTitle}
              role="listitem"
              aria-current={timelineStepIndex === stepIndex ? "step" : undefined}
              aria-label={stepTitle}
            >
              <TimelineDot
                className={cn("dark:bg-background", timelineStepIndex === stepIndex && "border-foreground")}
              />
            </TimelineItem>
          ))}
        </Timeline>

        {stepIndex > 0 && (
          <div
            key={stepIndex}
            className="flex flex-wrap items-center gap-3 justify-between opacity-100 motion-safe:transition-[opacity,translate] motion-safe:duration-300 motion-safe:starting:translate-y-1 motion-safe:starting:opacity-0"
          >
            <Title element="h1" size="md" id="application-step-title" tabIndex={-1} className="outline-none">
              {stepTitles[stepIndex]}
            </Title>

            {stepIndex === 1 && (
              <SelectedGroupsMenu
                selectedGroups={selectedGroups}
                onRemoveGroup={(groupId) => {
                  toggleGroup(groupId, false)
                }}
              />
            )}
          </div>
        )}
      </header>

      <form
        className="flex grow flex-col gap-8"
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
        <div ref={applicationStepContent} className="min-h-56 grow">
          {stepIndex === 0 && <ApplicationInformationStep />}

          {stepIndex === 1 && (
            <CommitteeSelectionStep
              groups={applicationPeriod.groups}
              selectedGroupIds={selectedGroupIds}
              maximumExclusiveGroups={maximumExclusiveGroups}
              onSelectionChange={toggleGroup}
            />
          )}

          {stepIndex === 2 && (
            <ApplicationDetailsStep
              studyYear={studyYear}
              aboutMe={aboutMe}
              onStudyYearChange={setSelectedStudyYear}
              onAboutMeChange={setAboutMe}
            />
          )}

          {stepIndex === 3 && (
            <InterviewAvailabilityStep
              applicationPeriod={applicationPeriod}
              unavailability={unavailability}
              onUnavailabilityChange={setUnavailability}
            />
          )}

          {stepIndex === 4 && (
            <GroupRankingStep
              selectedExclusiveGroups={selectedExclusiveGroups}
              selectedAdditiveGroups={selectedAdditiveGroups}
              onMoveGroup={moveGroup}
            />
          )}
          {stepIndex === 5 && (
            <ApplicationSummaryStep
              selectedExclusiveGroups={selectedExclusiveGroups}
              selectedAdditiveGroups={selectedAdditiveGroups}
              studyYear={studyYear}
              aboutMe={aboutMe}
              interviewAvailability={interviewAvailability}
            />
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

        <footer
          ref={applicationFooter}
          className="sticky bottom-0 z-30 grid grid-cols-2 items-center gap-3 bg-background pt-4 pb-[max(--spacing(4),env(safe-area-inset-bottom))]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-background"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full left-1/2 h-6 w-screen -translate-x-1/2 bg-linear-to-t from-background to-transparent"
          />

          {stepIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              disabled={submission.isPending || submission.isSuccess}
              onClick={() => setStepIndex((currentStepIndex) => currentStepIndex - 1)}
              className="min-h-16 text-base"
            >
              <IconArrowNarrowLeft className="size-5" />
              Tilbake
            </Button>
          )}

          {isScrollRequired && selectedGroups.length > 0 && <ScrollHint ref={scrollHint} />}

          <div className={cn(stepIndex === 0 && "col-span-2")}>
            <Button
              type={isScrollRequired ? "button" : "submit"}
              variant="default"
              disabled={
                (!canContinue && (!isScrollRequired || selectedGroups.length === 0)) ||
                submission.isPending ||
                submission.isSuccess
              }
              aria-disabled={isScrollRequired || undefined}
              aria-describedby={isScrollRequired && selectedGroups.length > 0 ? "application-scroll-hint" : undefined}
              onMouseEnter={showScrollHint}
              onFocus={showScrollHint}
              onClick={(event) => {
                if (isScrollRequired) {
                  event.preventDefault()
                  showScrollHint()
                }
              }}
              className="min-h-16 w-full text-base disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 aria-disabled:enabled:pointer-events-auto aria-disabled:enabled:cursor-pointer aria-disabled:transition-none aria-disabled:hover:bg-primary aria-disabled:enabled:active:scale-100"
            >
              {nextButtonText}
              {isScrollRequired && selectedGroups.length > 0 ? (
                <IconArrowDown className="size-5" aria-hidden="true" />
              ) : (
                <IconArrowNarrowRight className="size-5" />
              )}
            </Button>
          </div>
        </footer>
      </form>
    </div>
  )
}
