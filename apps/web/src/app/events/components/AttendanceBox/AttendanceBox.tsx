import { trpc } from "@/utils/trpc/client"
import type { Attendance, AttendancePool, Attendee, Event } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import clsx from "clsx"
import type { Session } from "next-auth"
import { type FC, useState } from "react"
import { AttendanceGroup } from "../AttendanceGroup"
import { StatusCard } from "../StatusCard"
import { useRegisterMutation, useSetExtrasChoicesMutation, useUnregisterMutation } from "../mutations"
import { ChooseExtrasDialog } from "./ChooseExtrasDialog"

type EventRegistrationStatus = "CLOSED" | "NOT_OPENED" | "OPEN"
const getEventRegistrationStatus = (registerStart: Date, registerEnd: Date, now: Date): EventRegistrationStatus => {
  if (now < registerStart) {
    return "NOT_OPENED"
  }

  if (now > registerEnd) {
    return "CLOSED"
  }

  return "OPEN"
}

interface Props {
  sessionUser?: Session["user"]
  attendance: Attendance
  pools: AttendancePool[]
  event: Event
  attendee: Attendee | null
}

export const AttendanceBox: FC<Props> = ({ sessionUser, attendance, pools, event, attendee }) => {
  const attendanceId = event.attendanceId
  const [extraDialogOpen, setExtraDialogOpen] = useState(false)
  const setExtrasChoices = useSetExtrasChoicesMutation()

  const { data: user } = trpc.user.getMe.useQuery()

  if (!attendanceId) {
    throw new Error("AttendanceBox rendered for event without attendance")
  }

  const handleGatherExtrasChoices = () => {
    if (attendance.extras !== null) {
      setExtraDialogOpen(true)
    }
  }

  const registerMutation = useRegisterMutation({ onSuccess: handleGatherExtrasChoices })
  const unregisterMutation = useUnregisterMutation()
  const eventRegistrationStatus = getEventRegistrationStatus(
    attendance.registerStart,
    attendance.registerEnd,
    new Date()
  )
  const userIsRegistered = Boolean(attendee)
  const myGroups = user && pools?.find((a) => a.yearCriteria.includes(user?.studyYear))

  const visiblePools = pools?.filter((pool) => pool.isVisible)

  const registerForAttendance = () => {
    if (!myGroups) {
      throw new Error("Tried to register user for attendance without a group")
    }

    if (!sessionUser) {
      throw new Error("Tried to register user without session")
    }

    registerMutation.mutate({
      attendancePoolId: myGroups?.id,
      userId: user?.id,
    })
  }

  const unregisterForAttendance = () => {
    if (!attendee) {
      throw new Error("Tried to unregister user that is not registered")
    }

    return unregisterMutation.mutate({
      id: attendee?.id,
    })
  }

  return (
    <div className="border-slate-5 min-h-64 mb-8 border px-4 py-8">
      <h2>Påmelding</h2>
      <div className="mt-2">
        <StatusCard attendance={attendance} />
      </div>

      <div>
        {eventRegistrationStatus === "OPEN" &&
          (userIsRegistered ? (
            <Button className="mt-2 w-full text-white" color="red" variant="solid" onClick={unregisterForAttendance}>
              Meld meg av
            </Button>
          ) : (
            <Button className="mt-2 w-full" onClick={registerForAttendance} disabled={!myGroups}>
              {myGroups ? 'Meld meg på' : 'Ikke åpent for ditt årstrinn'}
            </Button>
          ))}
      </div>

      {visiblePools?.length !== 0 && (
        <div className="mt-4">
          <h4 className="text-md font-bold">Påmeldingsgrupper</h4>
          <div className="flex flex-wrap w-full">
            {visiblePools?.map((group, idx) => (
              <AttendanceGroup
                title={group.title}
                numberOfPeople={group.numAttendees}
                totalSpots={group.capacity}
                key={group.id}
                className={clsx(idx === 0 ? "mr-2" : "", "mt-4 w-32")}
                isAttending={false}
                canAttend={false}
              />
            ))}
          </div>
        </div>
      )}

      {userIsRegistered && attendance.extras && (
        <div className="mt-4">
          <h4 className="text-md font-bold">Dine valg</h4>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Spørsmål</th>
                <th className="text-left">Valg</th>
              </tr>
            </thead>
            <tbody>
              {attendee?.extrasChoices?.map((choice) => (
                <tr key={choice.questionId}>
                  <td className="text-left">{choice.questionName}</td>
                  <td className="text-left">{choice.choiceName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button className="mt-2 w-32" variant={"outline"} onClick={handleGatherExtrasChoices}>
            Endre
          </Button>
        </div>
      )}

      <ChooseExtrasDialog
        defaultValues={attendee?.extrasChoices ?? null}
        setOpen={setExtraDialogOpen}
        open={extraDialogOpen}
        extras={attendance.extras ?? []}
        onSubmit={(values) => {
          if (!attendee) {
            throw new Error("Tried to set extras for a non-registered user")
          }
          setExtrasChoices.mutate({ id: attendee.id, choices: values })
          setExtraDialogOpen(false)
        }}
      />
    </div>
  )
}
