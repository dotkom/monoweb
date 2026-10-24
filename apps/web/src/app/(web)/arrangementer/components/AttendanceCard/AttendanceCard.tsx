"use client"

import { env } from "@/env"
import { useFullPathname } from "@/utils/use-full-pathname"
import type { AttendanceRouter } from "@dotkomonline/rpc"
import {
  type AttendanceView,
  buildRegistrationAvailabilityCompletionView,
  getAttendee,
  getNonAttendablePools,
} from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import type { User } from "@dotkomonline/rpc/user"
import { Button, Dialog, DialogTrigger, Text, Title, cn } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconArrowUpRight, IconCoins, IconQuestionMark, IconScript, IconUserEdit } from "@tabler/icons-react"
import { isPast, secondsToMilliseconds } from "date-fns"
import Link from "next/link"
import { useDeadlineTick } from "@/utils/use-deadline-tick"
import { useEffect, useState } from "react"
import { DeregisterModal } from "../DeregisterModal"
import { getAttendanceStatus } from "../attendanceStatus"
import { AttendanceCalendarButton } from "./AttendanceCalendarButton"
import { AttendanceDateInfo } from "./AttendanceDateInfo"
import { AttendanceTurnstile } from "./AttendanceTurnstile"
import { EventRulesDialogContent } from "./EventRules"
import { MainPoolCard } from "./MainPoolCard"
import { RegistrationDelayStatus } from "./RegistrationDelayStatus"
import { hasRegistrationDelay } from "./hasRegistrationDelay"
import { NonAttendablePoolsBox } from "./NonAttendablePoolsBox"
import { PaymentExplanationDialogContent } from "./PaymentExplanationDialog"
import { PunishmentBox } from "./PunishmentBox"
import { RegistrationButton, getTurnstileStatus } from "./RegistrationButton"
import { SelectionsForm } from "./SelectionsForm"
import { TicketButton } from "./TicketButton"
import { useEventTurnstile } from "../EventTurnstileProvider"
import { ViewAttendeesButton } from "./ViewAttendeesButton"
import { useAttendanceCardApi } from "./use-attendance-card-api"
import { AttendanceSection } from "./AttendanceSection"
import transitionStyles from "./AttendanceTransition.module.css"

type RegistrationAvailability = AttendanceRouter.GetRegistrationAvailabilityOutput

const TURNSTILE_LOAD_TIMEOUT_MS = secondsToMilliseconds(15)

interface AttendanceCardProps {
  initialAttendance: AttendanceView
  initialRegistrationAvailability: RegistrationAvailability | null
  user: User | null
  event: Event
  parentEvent: Event | null
  enableTurnstile?: boolean
  deferTurnstile?: boolean
  bulkSubscription?: { isConnected: boolean }
}

export const AttendanceCard = ({
  user,
  event,
  initialAttendance,
  initialRegistrationAvailability,
  enableTurnstile = true,
  deferTurnstile = false,
  bulkSubscription,
}: AttendanceCardProps) => {
  const backgroundVerification = useEventTurnstile()
  const backgroundToken = backgroundVerification?.token ?? null

  const fullPathname = useFullPathname()
  const authorizeUrl = createAuthorizeUrl({ returnTo: fullPathname })

  const [turnstileHasLoaded, setTurnstileHasLoaded] = useState(false)
  const [turnstileHasStarted, setTurnstileHasStarted] = useState(false)
  const [turnstileHasFailed, setTurnstileHasFailed] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileGeneration, setTurnstileGeneration] = useState(0)
  const [hideTurnstile, setHideTurnstile] = useState(false)

  const {
    attendance,
    registrationAvailability,
    registerForAttendance: registerWithToken,
    deregisterForAttendance,
    setSelectionOptions: handleSelectionChange,
    isRegisterActionPending,
  } = useAttendanceCardApi({
    initialAttendance,
    initialRegistrationAvailability,
    user,
    bulkSubscription,
    onDeregisterSuccess: () => setTurnstileToken(null),
  })

  const attendanceStatus = getAttendanceStatus(attendance)

  useEffect(() => {
    if (turnstileToken === null) {
      setHideTurnstile(false)

      return
    }

    const timeoutId = setTimeout(() => {
      setHideTurnstile(true)
    }, 1500)

    return () => clearTimeout(timeoutId)
  }, [turnstileToken])

  const attendee = getAttendee(attendance, user)
  useDeadlineTick(attendance.registerStart, attendance.registerEnd, attendee?.earliestReservationAt)
  const isRegistrationDelayed = hasRegistrationDelay(attendee)
  const deregistration = registrationAvailability?.deregistration ?? null
  const requiresTurnstile = user !== null && attendee === null && !isPast(attendance.registerEnd)
  const requiresLocalTurnstile = requiresTurnstile && backgroundToken === null

  const completion = buildRegistrationAvailabilityCompletionView(attendance, attendee)

  useEffect(() => {
    if (
      requiresLocalTurnstile === false ||
      enableTurnstile === false ||
      (deferTurnstile && turnstileHasStarted === false)
    ) {
      return
    }

    if (turnstileHasLoaded || turnstileHasFailed || turnstileToken) {
      return
    }

    const timeoutId = setTimeout(() => {
      setTurnstileHasFailed(true)
    }, TURNSTILE_LOAD_TIMEOUT_MS)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [
    requiresLocalTurnstile,
    enableTurnstile,
    deferTurnstile,
    turnstileHasStarted,
    turnstileHasLoaded,
    turnstileHasFailed,
    turnstileToken,
  ])

  const punishment = registrationAvailability?.punishment ?? null
  const chargeScheduleDate = registrationAvailability?.deregistration?.chargeScheduleDate ?? null

  const [attendeeListOpen, setAttendeeListOpen] = useState(false)
  const [deregisterModalOpen, setDeregisterModalOpen] = useState(false)

  const paymentIsMissing = completion?.missingRequirements.includes("PAYMENT") ?? false
  const paymentLink = completion?.paymentLink ?? null
  const showPaymentLink = paymentIsMissing && paymentLink !== null

  const registerForAttendance = () => {
    const token = turnstileToken ?? backgroundVerification?.takeToken() ?? null

    if (token === null) {
      return
    }

    setTurnstileToken(null)
    setTurnstileHasLoaded(false)
    setTurnstileHasStarted(false)
    setTurnstileHasFailed(false)
    setTurnstileGeneration((generation) => generation + 1)

    registerWithToken(token)
  }

  const handleTurnstileVerify = (token: string) => {
    setTurnstileHasFailed(false)
    setTurnstileToken(token)
  }

  const handleTurnstileError = (error: string) => {
    console.error("Turnstile error:", error)
    setTurnstileHasFailed(true)
    setTurnstileToken(null)
  }

  const handleTurnstileLoad = () => {
    setTurnstileHasFailed(false)
    setTurnstileHasLoaded(true)
  }

  const turnstileStatus = getTurnstileStatus({
    requiresTurnstile,
    turnstileToken: turnstileToken ?? backgroundToken,
    turnstileHasFailed,
    turnstileHasLoaded,
  })

  const hasPunishment = punishment !== null && (punishment.delay > 0 || punishment.suspended)
  const showOtherPools = attendance.pools.length === 0 || getNonAttendablePools(attendance, user).length > 0

  return (
    <div className="flex flex-col gap-6 sm:gap-2">
      <section className="flex flex-col gap-4 min-h-24 text-base sm:p-2 sm:rounded-2xl sm:border-2 sm:border-gray-100 sm:dark:border-stone-800 sm:dark:bg-stone-800">
        <div className="flex flex-row items-center justify-between gap-2 pl-3 pr-2 pt-2">
          <Title element="h2" size="md">
            Påmelding
          </Title>

          <AttendanceCalendarButton event={event} attendance={attendance} />
        </div>

        <div className="flex flex-col w-full">
          {attendee && deregistration?.requiresDeregisterReason && (
            <DeregisterModal
              open={deregisterModalOpen}
              setOpen={setDeregisterModalOpen}
              event={event}
              unregisterForAttendance={deregisterForAttendance}
              attendee={attendee}
            />
          )}

          <div className="px-3">
            <AttendanceDateInfo attendance={attendance} attendee={attendee} chargeScheduleDate={chargeScheduleDate} />
          </div>

          <AttendanceSection contentClassName="pt-8">
            {punishment && hasPunishment && !attendee && <PunishmentBox punishment={punishment} />}
          </AttendanceSection>

          <div className="flex flex-col w-full pt-8">
            <MainPoolCard
              attendance={attendance}
              user={user}
              authorizeUrl={authorizeUrl}
              chargeScheduleDate={chargeScheduleDate}
              hasAttachedActionBelow={showPaymentLink || isRegistrationDelayed}
            />

            <AttendanceSection contentClassName="pt-1.5">
              {isRegistrationDelayed && attendee && <RegistrationDelayStatus attendee={attendee} />}
            </AttendanceSection>

            <AttendanceSection contentClassName="pt-1.5">
              {showPaymentLink && (
                <Link
                  href={paymentLink}
                  className={cn(
                    "flex flex-row items-center justify-center w-full gap-2 rounded-t-md rounded-b-xl p-2 min-h-16",
                    "text-base font-medium",
                    "transition-colors bg-gray-200 hover:bg-gray-100 dark:bg-stone-700 dark:hover:bg-stone-600"
                  )}
                >
                  <IconCoins className="size-[1.25em]" />
                  <Text>Gå til betaling</Text>
                  <IconArrowUpRight className="size-[1.25em]" />
                </Link>
              )}
            </AttendanceSection>
          </div>

          <AttendanceSection contentClassName="pt-8 px-3">
            {attendee?.registered && attendance.selections.length > 0 && (
              <div className="flex flex-col gap-2">
                <Title element="p" size="sm" className="text-base">
                  Valg
                </Title>

                <SelectionsForm
                  attendance={attendance}
                  attendee={attendee}
                  onSubmit={handleSelectionChange}
                  disabled={attendanceStatus === "CLOSED"}
                />
              </div>
            )}
          </AttendanceSection>

          <AttendanceSection contentClassName="pt-8">
            {showOtherPools && <NonAttendablePoolsBox attendance={attendance} user={user} />}
          </AttendanceSection>

          <div className="flex flex-col gap-4 w-full pt-8">
            <div className={cn("grid grid-cols-1 gap-4", attendee?.registered && "sm:grid-cols-2")}>
              {attendee?.registered && <TicketButton attendee={attendee} />}

              <ViewAttendeesButton
                attendance={attendance}
                user={user}
                attendeeListOpen={attendeeListOpen}
                setAttendeeListOpen={setAttendeeListOpen}
                hasTicketButton={Boolean(attendee?.registered)}
              />
            </div>

            <RegistrationButton
              registerForAttendance={registerForAttendance}
              unregisterForAttendance={deregisterForAttendance}
              attendance={attendance}
              registrationAvailability={registrationAvailability}
              user={user}
              isLoading={isRegisterActionPending}
              turnstileStatus={turnstileStatus}
              setDeregisterModalOpen={setDeregisterModalOpen}
            />

            {requiresLocalTurnstile && isRegisterActionPending === false && (
              <div
                className={cn(
                  { hidden: hideTurnstile },
                  "relative rounded-md bg-gray-200 dark:bg-stone-700",
                  transitionStyles.state
                )}
              >
                <AttendanceTurnstile
                  key={turnstileGeneration}
                  enabled={enableTurnstile}
                  defer={deferTurnstile}
                  onStart={() => setTurnstileHasStarted(true)}
                  sitekey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  retry="auto"
                  refreshExpired="auto"
                  onError={handleTurnstileError}
                  onVerify={handleTurnstileVerify}
                  onExpire={() => setTurnstileToken(null)}
                  onLoad={handleTurnstileLoad}
                  size="flexible"
                  className="h-[4.05rem]" // Without this a padding occurs below the widget
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-row flex-wrap items-center gap-0.5 px-4">
        <EventRulesButton />
        <DietaryPreferencesButton />
        {Boolean(attendance.attendancePrice) && <PaymentExplanationButton />}
      </div>
    </div>
  )
}

const PaymentExplanationButton = () => (
  <Dialog>
    <DialogTrigger
      render={
        <Button
          variant="ghost"
          size="sm"
          aria-label="Hvordan virker betaling?"
          className="px-1.5 text-muted-foreground dark:hover:text-foreground max-sm:text-sm"
        >
          <IconQuestionMark aria-hidden className="size-4" />
          Om betaling
        </Button>
      }
    />
    <PaymentExplanationDialogContent />
  </Dialog>
)

const DietaryPreferencesButton = () => (
  <Button
    element={Link}
    variant="ghost"
    size="sm"
    href="/innstillinger/profil"
    aria-label="Oppdater matpreferanser"
    className="px-1.5 text-muted-foreground dark:hover:text-foreground max-sm:text-sm"
  >
    <IconUserEdit aria-hidden className="size-4" />
    Matpreferanser
  </Button>
)

const EventRulesButton = () => (
  <Dialog>
    <DialogTrigger
      render={
        <Button
          variant="ghost"
          size="sm"
          aria-label="Arrangementregler"
          className="px-1.5 text-muted-foreground dark:hover:text-foreground max-sm:text-sm"
        >
          <IconScript aria-hidden className="size-4" />
          Regler
        </Button>
      }
    />
    <EventRulesDialogContent />
  </Dialog>
)

export const AttendanceCardSkeleton = () => {
  const skeletonText = (heightAndWidth: string) => (
    <div className={cn("h-4 bg-gray-300 dark:bg-stone-600 rounded-full animate-pulse", heightAndWidth)} />
  )

  const dateInfo = () => (
    <div className="flex flex-col gap-1 w-[25%]">
      {skeletonText("w-[80%] h-5")}
      {skeletonText("w-[90%] h-5")}
    </div>
  )

  const title = skeletonText("w-[50%] h-8")
  const card = <div className="min-h-48 rounded-lg bg-gray-300 dark:bg-stone-600 animate-pulse" />
  const button = <div className="min-h-16 rounded-lg bg-gray-300 dark:bg-stone-600 animate-pulse" />

  return (
    <section className="flex flex-col gap-4 min-h-24 rounded-lg sm:border sm:border-gray-200 sm:dark:border-stone-800 sm:dark:bg-stone-800 sm:p-2 sm:rounded-xl">
      <div className="pl-3 pt-3">{title}</div>

      <div className="flex flex-row gap-2 items-center px-3">
        {dateInfo()}
        <span className="grow h-0.5 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse invisible sm:visible" />
        {dateInfo()}
        <span className="grow h-0.5 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse invisible sm:visible" />
        {dateInfo()}
      </div>

      {card}

      {button}

      {button}
    </section>
  )
}
