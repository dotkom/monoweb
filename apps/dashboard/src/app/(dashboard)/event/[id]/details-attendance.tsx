import { FC, useState } from "react"
import { useEventDetailsContext } from "./provider"
import { Table, Checkbox, Box, Text, Title } from "@mantine/core"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"
import { useUpdateEventAttendanceMutation } from "src/modules/event/mutations/use-update-event-attendance-mutation"

export const EventDetailsAttendance: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventAttendance } = useEventAttendanceGetQuery(event.id)
  const updateAttendance = useUpdateEventAttendanceMutation()

  const [localAttended, setLocalAttended] = useState<{ [key: string]: boolean }>({})

  const toggleAttendance = (userId: string, attendanceId: string, attended: boolean) => {
    updateAttendance.mutate(
      { userId, attendanceId, attended: !attended },
      {
        onSuccess: (data) => {
          setLocalAttended((prev) => ({ ...prev, [userId]: data.attended }))
        },
      }
    )
  }

  return (
    <Box>
      <Title order={3}>Påmeldte</Title>
      {eventAttendance?.map((attendance) => (
        <Box key={attendance.id} mb="sm">
          <Title order={4}>
            {attendance.id} {"(" + attendance.attendees.length + "/" + attendance.limit + ")"}
          </Title>
          <Table>
            <thead>
              <tr>
                <th>Bruker</th>
                <th>Møtt</th>
              </tr>
            </thead>
            <tbody>
              {attendance.attendees.map((attendee) => (
                <tr key={attendee.id}>
                  <td>
                    <Text>{attendee.userId}</Text>
                  </td>
                  <td>
                    <Checkbox
                      checked={localAttended[attendee.userId] ?? attendee.attended}
                      onChange={() =>
                        toggleAttendance(
                          attendee.userId,
                          attendance.id,
                          localAttended[attendee.userId] ?? attendee.attended
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      ))}
    </Box>
  )
}
