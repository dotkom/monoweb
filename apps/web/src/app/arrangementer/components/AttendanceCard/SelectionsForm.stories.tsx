import type { Attendance } from "@dotkomonline/rpc/attendance"
import { getAttendee } from "@dotkomonline/rpc/attendance"
import { Badge, Text, Title } from "@dotkomonline/ui"
import {
  createAttendanceWithSelectionsComplete,
  createAttendanceWithSelectionsPending,
  createMockAttendance,
  createMockUser,
  mockFoodSelection,
} from "../../../../../.ladle/fixtures/attendance"
import { SelectionsForm } from "./SelectionsForm"

export default {
  title: "Attendance Card/Selections Form",
  component: SelectionsForm,
}

const noop = () => {}

const SelectionsSectionPreview = ({
  label,
  attendance,
  showIncompleteBadge = false,
  disabled = false,
}: {
  label: string
  attendance: Attendance
  showIncompleteBadge?: boolean
  disabled?: boolean
}) => {
  const user = createMockUser()
  const attendee = getAttendee(attendance, user)

  if (attendee === null) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 max-w-md">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <Title element="p" size="sm" className="text-base">
            Valg
          </Title>
          {showIncompleteBadge && (
            <Badge color="red" className="px-1.5 py-0.5 text-xs rounded-sm">
              Ikke fullført
            </Badge>
          )}
        </div>
        <SelectionsForm attendance={attendance} attendee={attendee} onSubmit={noop} disabled={disabled} />
      </div>
    </div>
  )
}

export const AllStates = () => {
  return (
    <div className="flex flex-col gap-8">
      <SelectionsSectionPreview
        label="Incomplete selections"
        attendance={createAttendanceWithSelectionsPending()}
        showIncompleteBadge
      />

      <SelectionsSectionPreview label="Complete selections" attendance={createAttendanceWithSelectionsComplete()} />

      <SelectionsSectionPreview
        label="Disabled (closed attendance)"
        attendance={createMockAttendance({
          status: "CLOSED",
          selections: [mockFoodSelection],
          attendees: createAttendanceWithSelectionsPending().attendees,
        })}
        showIncompleteBadge
        disabled
      />
    </div>
  )
}
