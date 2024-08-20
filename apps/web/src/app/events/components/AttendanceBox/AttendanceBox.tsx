import { trpc } from "@/utils/trpc/client"
import type { Attendance, AttendancePool, Attendee, Event } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import clsx from "clsx"
import type { Session } from "next-auth"
import { type FC, type ReactElement, useState } from "react"
import { getStructuredDateInfo } from "../../utils"
import { AttendanceBoxPool } from "../AttendanceBoxPool"
import { useRegisterMutation, useSetExtrasChoicesMutation, useUnregisterMutation } from "../mutations"
import ChooseExtrasDialog from "./ChooseExtrasDialog"

interface Props {
  sessionUser?: Session["user"]
  attendance: Attendance
  pools: AttendancePool[]
  event: Event
  attendee: Attendee | null
}

// Biome ignores do not work in the middle of jsx so this is extracted just to igonre the rule here
// biome-ignore lint/security/noDangerouslySetInnerHtml: We do not pass any user input into this, so it is safe
const span = (text: string) => <span dangerouslySetInnerHTML={{ __html: text }} />

export const AttendanceBox: FC<Props> = ({ sessionUser, attendance, pools, event, attendee }) => {
  const attendanceId = event.attendanceId
  const [extraDialogOpen, setExtraDialogOpen] = useState(false)
  const setExtrasChoices = useSetExtrasChoicesMutation()

  const { data: user } = trpc.user.getMe.useQuery()

  if (!attendanceId) {
    throw new Error("AttendanceBox rendered for event without attendance")
  }

  const structuredDateInfo = getStructuredDateInfo(attendance, new Date())

  const handleGatherExtrasChoices = () => {
    if (attendance.extras !== null) {
      setExtraDialogOpen(true)
    }
  }

  const registerMutation = useRegisterMutation({ onSuccess: handleGatherExtrasChoices })
  const unregisterMutation = useUnregisterMutation()

  const userIsRegistered = Boolean(attendee)

  const attendablePoolOrNullish = user && pools.find((pool) => pool.yearCriteria.includes(user?.studyYear))
  const canAttend = Boolean(attendablePoolOrNullish) && structuredDateInfo.status === "OPEN"

  const registerForAttendance = () => {
    if (!attendablePoolOrNullish) {
      throw new Error("Tried to register user for attendance without a group")
    }

    if (!sessionUser) {
      throw new Error("Tried to register user without session")
    }

    registerMutation.mutate({
      attendancePoolId: attendablePoolOrNullish?.id,
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

  let changeRegisteredStateButton: ReactElement<typeof Button>
  let eventAttendanceStatusText: string

  switch (structuredDateInfo.status) {
    case "NOT_OPENED": {
      eventAttendanceStatusText = `Åpner ${formatDate(structuredDateInfo.timeUtilOpen)}`
      break
    }
    case "OPEN": {
      eventAttendanceStatusText = `Stenger ${formatDate(structuredDateInfo.timeUntilClose)}`
      break
    }
    case "CLOSED": {
      eventAttendanceStatusText = `Stengte ${formatDate(structuredDateInfo.timeElapsedSinceClose)}`
      break
    }
    default:
      throw new Error("Unknown status")
  }

  if (userIsRegistered) {
    changeRegisteredStateButton = (
      <Button className="w-full text-white rounded-lg" color="red" variant="solid" onClick={unregisterForAttendance}>
        Meld meg av
      </Button>
    )
  } else {
    changeRegisteredStateButton = (
      <Button
        className={clsx(
          "w-full rounded-lg uppercase flex flex-col gap-3 items-center h-fit p-2",
          canAttend ? "bg-green-10" : "bg-slate-10"
        )}
        onClick={registerForAttendance}
        disabled={!canAttend}
      >
        <span className="block">Meld meg på</span>
        <span className="block text-sm">{eventAttendanceStatusText}</span>
      </Button>
    )
  }

  const viewAttendeesButton = (
    <Button className="w-full rounded-lg uppercase bg-blue-10 h-100" onClick={() => console.log("WIP")}>
      Se påmeldte
    </Button>
  )

  return (
    <section className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] mb-8 p-4 gap-3">
      <h2 className="border-none">Påmelding</h2>
      {<AttendanceBoxPool pool={attendablePoolOrNullish} />}
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

      {userIsRegistered && attendance.extras && (
        <section>
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

          <ChooseExtrasDialog
            defaultValues={attendee?.extrasChoices && { choices: attendee?.extrasChoices }}
            /*setOpen={setExtraDialogOpen}*/
            /*open={extraDialogOpen}*/
            extras={attendance.extras ?? []}
            onSubmit={(values) => {
              if (!attendee) {
                throw new Error("Tried to set extras for a non-registered user")
              }
              setExtrasChoices.mutate({ id: attendee.id, choices: values })
              setExtraDialogOpen(false)
            }}
          />
        </section>
      )}

      <div className="flex flex-row gap-3">
        {viewAttendeesButton}
        {changeRegisteredStateButton}
      </div>
    </section>
  )
}
