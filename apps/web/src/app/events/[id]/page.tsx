"use client"

import { Button } from "@dotkomonline/ui"
import { trpc } from "@/utils/trpc/client"

interface EventDetailPageProps {
  params: { id: string }
}

const EventDetailPage = ({ params: { id } }: EventDetailPageProps) => {
  const { data } = trpc.event.get.useQuery(id)
  const { data: attendance } = trpc.event.attendance.get.useQuery({ eventId: id })
  const { mutate: addAttendance } = trpc.event.attendance.create.useMutation()
  const { mutate: attendEvent } = trpc.event.attendance.attend.useMutation()
  const utils = trpc.useContext()

  return (
    <div>
      <h1>Event</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button
        onClick={async () => {
          await addAttendance({
            start: new Date(),
            end: new Date(),
            deregisterDeadline: new Date(),
            eventId: id,
            limit: 20,
            min: 1,
            max: 5,
          })
          utils.event.attendance.get.invalidate()
        }}
      >
        Add attendance group
      </Button>
      <Button
        onClick={async () => {
          await attendEvent({
            eventId: id,
          })
          utils.event.attendance.get.invalidate()
        }}
      >
        Join random group
      </Button>
      <h2>Attendance</h2>
      <pre>{JSON.stringify(attendance, null, 2)}</pre>
    </div>
  )
}

export default EventDetailPage
