import { Text, Title } from "@dotkomonline/ui"
import { addMinutes } from "date-fns"
import { createMockAttendance, createMockAttendee, createMockUser } from "../../../../../.ladle/fixtures/attendance"
import { SelectionDeadlineBar, SelectionsForm } from "./SelectionsForm"

const foodSelection = {
  id: "selection-food",
  name: "Mat",
  options: [
    { id: "option-meat", name: "Kjøtt" },
    { id: "option-vegetarian", name: "Vegetar" },
  ],
}

export default {
  title: "Attendance Card/Selections Form",
}

export const PendingDeadline = () => {
  const user = createMockUser()
  const attendee = createMockAttendee({
    user,
    selectionDeadline: addMinutes(new Date(), 45),
  })
  const attendance = {
    ...createMockAttendance({ attendees: [attendee] }),
    selections: [foodSelection],
  }

  return (
    <div className="flex max-w-md flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Selection deadline</Text>
      <div className="flex flex-row items-center gap-2">
        <Title element="p" size="sm" className="text-base">
          Valg
        </Title>
        <SelectionDeadlineBar deadline={attendee.selectionDeadline ?? new Date()} reserved={attendee.reserved} />
      </div>
      <SelectionsForm attendance={attendance} attendee={attendee} onSubmit={() => undefined} />
    </div>
  )
}

export const RetrospectiveAttendee = () => {
  const user = createMockUser()
  const attendee = createMockAttendee({ user, selectionDeadline: null })
  const attendance = {
    ...createMockAttendance({ attendees: [attendee] }),
    selections: [foodSelection],
  }

  return (
    <div className="flex max-w-md flex-col gap-2">
      <Text className="text-sm text-muted-foreground">No deadline</Text>
      <SelectionsForm attendance={attendance} attendee={attendee} onSubmit={() => undefined} />
    </div>
  )
}
