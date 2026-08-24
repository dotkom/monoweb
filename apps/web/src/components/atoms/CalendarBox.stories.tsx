import { Text } from "@dotkomonline/ui"
import { CalendarBox } from "./CalendarBox"

export default {
  title: "Calendar Box",
  component: CalendarBox,
}

export const AllStates = () => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Same day</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(2026, 7, 24, 18, 0)} end={new Date(2026, 7, 24, 22, 0)} />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Multiple days</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(2026, 7, 8, 10, 0)} end={new Date(2026, 7, 10, 18, 0)} />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Spans month change</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(2026, 7, 28, 12, 0)} end={new Date(2026, 8, 2, 23, 59)} />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Spans year change</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(2026, 11, 31, 20, 0)} end={new Date(2027, 0, 1, 4, 0)} />
      </div>
    </div>
  </div>
)
