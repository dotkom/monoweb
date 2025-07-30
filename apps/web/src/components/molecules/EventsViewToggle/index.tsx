import { Button, Icon, Text, cn } from "@dotkomonline/ui"
import type { FC } from "react"

interface EventsViewToggleProps {
  active: "list" | "cal"
}

// TODO: give this more user feedback/use tabs component
export const EventsViewToggle: FC<EventsViewToggleProps> = ({ active }) => {
  const listIcon = <Icon icon="tabler:layout-list" className="text-sm" />
  const calendarIcon = <Icon icon="tabler:calendar-month" className="text-sm" />

  const activeStyle = "hover:bg-gray-200 dark:bg-stone-700 dark:hover:bg-stone-700"
  const inactiveStyle =
    "bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent text-gray-800 hover:text-black"

  return (
    <div className="w-fit border border-gray-200 dark:border-none dark:bg-stone-800 flex flex-row items-center rounded-lg p-1">
      <Button
        element="a"
        href="/arrangementer"
        color="light"
        icon={listIcon}
        className={cn(active !== "list" ? inactiveStyle : activeStyle)}
      >
        <Text className="text-sm">Liste</Text>
      </Button>

      <Button
        element="a"
        href="/arrangementer/kalender"
        color="light"
        icon={calendarIcon}
        className={cn(active !== "cal" ? inactiveStyle : activeStyle)}
      >
        <Text className="text-sm">Kalender</Text>
      </Button>
    </div>
  )
}
