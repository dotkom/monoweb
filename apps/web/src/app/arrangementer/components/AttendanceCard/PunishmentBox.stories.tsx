import { createMockPunishment } from "../../../../../.ladle/fixtures/attendance"
import { PunishmentBox } from "./PunishmentBox"
import { Text } from "@dotkomonline/ui"

export default {
  title: "Attendance Card/Punishment Box",
  component: PunishmentBox,
}

export const AllStates = () => (
  <div className="flex flex-col gap-8 max-w-md">
    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Delay punishment</Text>
      <PunishmentBox punishment={createMockPunishment({ delay: 4, suspended: false })} />
    </div>

    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Suspended</Text>
      <PunishmentBox punishment={createMockPunishment({ delay: 0, suspended: true })} />
    </div>
  </div>
)
