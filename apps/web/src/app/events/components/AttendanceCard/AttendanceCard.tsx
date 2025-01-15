"use client"

import { trpc } from "@/utils/trpc/client"
import type { ExtrasChoices, WebEventDetail } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import type { Session } from "next-auth"
import { type FC, useMemo, useState } from "react"
import { AttendanceBoxPool } from "../AttendanceBoxPool"
import { useRegisterMutation, useSetExtrasChoicesMutation, useUnregisterMutation } from "../mutations"
import ChooseExtrasForm from "./ChooseExtrasDialog"
import { RegistrationButton } from "./RegistrationButton"
import ViewAttendeesDialogButton from "./ViewAttendeesButton"

interface AttendanceCardProps {
  sessionUser?: Session["user"]
  initialEventDetail: WebEventDetail
}

export const AttendanceCard: FC<AttendanceCardProps> = ({ sessionUser, initialEventDetail }) => {
  const { data: eventDetail, ...eventDetailQuery } = trpc.event.getWebEventDetailData.useQuery(
    initialEventDetail.event.id,
    {
      enabled: Boolean(sessionUser),
      initialData: initialEventDetail,
    }
  )

  if (!eventDetail || !eventDetail.hasAttendance) {
    return null
  }

  return (
    <AttendanceCardInner
      sessionUser={sessionUser}
      eventDetail={eventDetail}
      refetchEventDetail={eventDetailQuery.refetch}
    />
  )
}

interface InnerAttendanceCardProps {
  sessionUser?: Session["user"]
  eventDetail: Extract<WebEventDetail, { hasAttendance: true }>
  refetchEventDetail: () => void
}

export const AttendanceCardInner: FC<InnerAttendanceCardProps> = ({ sessionUser, eventDetail, refetchEventDetail }) => {
  const { data: attendee } = trpc.event.attendance.getAttendee.useQuery(
    {
      attendanceId: eventDetail.attendance.id,
      userId: sessionUser?.id ?? "",
    },
    {
      enabled: Boolean(sessionUser) && eventDetail.hasAttendance,
    }
  )

  const [, setExtraDialogOpen] = useState(false)
  const setExtrasChoices = useSetExtrasChoicesMutation()

  const { data: user } = trpc.user.getMe.useQuery()

  const handleGatherExtrasChoices = () => {
    if (eventDetail.attendance.extras !== null) {
      setExtraDialogOpen(true)
    }
  }

  const { data: attendablePool } = trpc.attendance.getAttendablePool.useQuery(
    {
      attendanceId: eventDetail.attendance.id,
      userId: user?.id ?? "",
    },
    {
      enabled: user !== undefined && eventDetail.hasAttendance,
    }
  )

  const attendedPool = attendee?.attendancePoolId
    ? eventDetail.pools.find((pool) => pool.id === attendee.attendancePoolId)
    : null

  const now = useMemo(() => new Date(), [])

  const { data: canRegisterToEvent } = trpc.attendance.canRegisterForEvent.useQuery(
    {
      userId: user?.id ?? "",
      attendancePoolId: attendablePool?.id ?? "",
      registeredAt: now,
    },
    {
      enabled: Boolean(user) && Boolean(attendablePool),
    }
  )

  const { data: canDeregisterToEvent } = trpc.attendance.canDeregisterForEvent.useQuery(
    {
      attendeeId: attendee?.id ?? "",
      deregisteredAt: now,
    },
    {
      enabled: Boolean(attendee?.id),
    }
  )

  const registerMutation = useRegisterMutation({ onSuccess: handleGatherExtrasChoices })
  const unregisterMutation = useUnregisterMutation()
  const registerLoading = registerMutation.isLoading || unregisterMutation.isLoading

  const userIsRegistered = Boolean(attendee)

  const [attendeeListOpen, setAttendeeListOpen] = useState(false)

  const { data: attendeePublicInformation } = trpc.attendance.getPublicAttendeeInformation.useQuery(
    {
      id: eventDetail.attendance.id,
    },
    {
      enabled: attendeeListOpen && eventDetail.hasAttendance,
    }
  )

  const registerForAttendance = async () => {
    if (!attendablePool) {
      throw new Error("Tried to register user for attendance without a group")
    }

    if (!sessionUser || !user) {
      throw new Error("Tried to register user without session")
    }

    registerMutation.mutate({
      attendancePoolId: attendablePool.id,
      userId: user.id,
    })

    refetchEventDetail()
  }

  const unregisterForAttendance = async () => {
    if (!attendee) {
      throw new Error("Tried to unregister user that is not registered")
    }

    unregisterMutation.mutate({
      id: attendee.id,
    })

    refetchEventDetail()
  }

  return (
    <section className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] mb-8 p-6 gap-3">
      <h2 className="border-none">Påmelding</h2>
      <AttendanceBoxPool pool={attendablePool || attendedPool} isAttending={userIsRegistered} />

      <div className="flex flex-row gap-3">
        <ViewAttendeesDialogButton attendeeListOpen={attendeeListOpen} setAttendeeListOpen={setAttendeeListOpen} />
        {attendee !== undefined && (
          <RegistrationButton
            attendee={attendee}
            attendance={eventDetail.attendance}
            registerForAttendance={registerForAttendance}
            unregisterForAttendance={unregisterForAttendance}
            isLoading={registerLoading}
            enabled={canRegisterToEvent || canDeregisterToEvent}
          />
        )}
      </div>

      {attendee && eventDetail.attendance.extras !== null && (
        <div className="w-full">
          <ChooseExtrasForm
            extras={eventDetail.attendance.extras}
            onSubmit={(choices: ExtrasChoices) => {
              setExtrasChoices.mutate({
                id: attendee.id,
                choices,
              })
              setExtraDialogOpen(false)
            }}
          />
        </div>
      )}

      <div className="flex flex-row gap-3">
        <p className="text-xs text-slate-9">Avmeldingsfrist 12:00 23.09.2024</p>
      </div>
      <div className="flex flex-row gap-3">
        <a href="/profile">
          <p className="text-xs text-slate-9">
            <Icon className="inline-block align-middle text-lg" icon="tabler:edit" />
            Oppdater matallergier
          </p>
        </a>
        <p className="text-xs text-slate-9">
          <Icon className="inline-block align-middle text-lg" icon="tabler:book-2" />
          Arrangementbregler
        </p>
      </div>
    </section>
  )
}
