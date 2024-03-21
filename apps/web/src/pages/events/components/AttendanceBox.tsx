import { trpc } from "@/utils/trpc"
import { Attendance, AttendancePool, Event } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import clsx from "clsx"
import { type FC } from "react"
import { Session } from "../.."
import { AttendanceGroup } from "./AttendanceGroup"
import { StatusCard, calculateStatus, getStatusCardData } from "./StatusCard"

interface Props {
  user: Session["user"]
  attendance: Attendance
  pools: AttendancePool[]
  event: Event
}

export const AttendanceBox: FC<Props> = ({ user, attendance, pools, event }) => {
  const attendanceId = event.attendanceId

  const utils = trpc.useUtils()
  const unattendMutation = trpc.event.attendance.deregisterForEvent.useMutation({
    onSuccess: () => {
      utils.event.attendance.getPoolsByAttendanceId.invalidate({
        id: attendanceId || "",
      })
      utils.event.attendance.isAttending.invalidate({
        attendanceId: attendance?.id || "",
        userId: user.id,
      })
    },
    onError: (error) => {
      console.error(error)
    },
  })

  const attendMutation = trpc.event.attendance.registerForEvent.useMutation({
    onSuccess: () => {
      utils.event.attendance.getPoolsByAttendanceId.invalidate({ id: attendanceId || "" })
      utils.event.attendance.isAttending.invalidate({
        attendanceId: attendance?.id || "",
        userId: user.id,
      })
    },
    onError: (error) => {
      console.error(error)
    },
  })

  const { data: selfAttendee } = trpc.event.attendance.isAttending.useQuery({
    attendanceId: attendance?.id || "",
    userId: user.id,
  })

  const STATUS = calculateStatus({
    registerStart: attendance.registerStart,
    registerEnd: attendance.registerEnd,
    now: new Date(),
  })

  const statusData = getStatusCardData(STATUS, attendance?.registerStart)

  const myGroups = pools?.find((a) => a.yearCriteria.includes(user.studyYear))
  const otherGroups = pools?.filter((group) => group.id !== myGroups?.id)

  const isAttending = Boolean(selfAttendee)

  const attend = () => {
    if (!user.id) {
      return
    }

    if (!attendance?.id) {
      return
    }

    attendMutation.mutate({
      attendanceId: attendance.id,
      userId: user.id,
    })
  }

  const unAttend = () => {
    if (!user.id) {
      return
    }

    if (!selfAttendee?.id) {
      return
    }

    if (!attendance?.id) {
      return
    }

    unattendMutation.mutate({
      id: selfAttendee.id,
    })
  }

  return (
    <div className="border-slate-5 min-h-64 mb-8 border px-4 py-8">
      <h2>Påmelding</h2>
      <div className="mt-2">
        <StatusCard {...statusData} />
      </div>
      <div>
        {myGroups && (
          <AttendanceGroup
            title={"TODO: navn"}
            numberOfPeople={myGroups.numAttendees}
            totalSpots={myGroups.limit}
            isAttending={isAttending}
            canAttend={true}
          />
        )}
        {isAttending ? (
          <Button className="mt-2 w-full text-white" color="red" variant="solid" onClick={unAttend}>
            Meld meg av
          </Button>
        ) : (
          <Button className="mt-2 w-full" onClick={attend}>
            Meld meg på
          </Button>
        )}
      </div>

      {otherGroups?.length !== 0 && (
        <div className="mt-4">
          <p>Andre grupper med reserverte plasser</p>
          {otherGroups?.map((group, idx) => (
            <AttendanceGroup
              title={"1.-5. klasse"}
              numberOfPeople={group.numAttendees}
              totalSpots={group.limit}
              key={group.id}
              className={clsx(idx === 0 ? "mr-2" : "", "mt-4 w-32")}
              isAttending={false}
              canAttend={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
