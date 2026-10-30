import { Text } from "@dotkomonline/ui"
import { CalendarBox } from "./CalendarBox"

const year = new Date().getFullYear()

export default {
  title: "Calendar Box",
  component: CalendarBox,
}

export const AllStates = () => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Same day</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(year, 7, 24, 18, 0)} end={new Date(year, 7, 24, 22, 0)} />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Multiple days</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(year, 7, 8, 10, 0)} end={new Date(year, 7, 10, 18, 0)} />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Spans month change</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(year, 5, 28, 12, 0)} end={new Date(year, 6, 2, 23, 59)} />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Spans year change</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(year, 11, 31, 20, 0)} end={new Date(year + 1, 0, 1, 4, 0)} />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Same day in another year</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(year + 1, 7, 24, 18, 0)} end={new Date(year + 1, 7, 24, 22, 0)} />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Multiple days in another year</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(year + 1, 7, 8, 10, 0)} end={new Date(year + 1, 7, 10, 18, 0)} />
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Spans month change in another year</Text>

      <div className="w-fit">
        <CalendarBox start={new Date(year + 1, 5, 28, 12, 0)} end={new Date(year + 1, 6, 2, 23, 59)} />
      </div>
    </div>
  </div>
)
