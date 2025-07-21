import { Button, Icon, Text, cn } from "@dotkomonline/ui"
import Link from "next/link"
import type { FC } from "react"

interface EventsViewToggleProps {
  active: "list" | "cal"
}

// TODO: give this more user feedback/use tabs component
export const EventsViewToggle: FC<EventsViewToggleProps> = ({ active }) => {
  const listIcon = <Icon icon="tabler:layout-list" className="text-sm" />
  const calendarIcon = <Icon icon="tabler:calendar-month" className="text-sm" />

  const activeStyle = "hover:bg-gray-200 dark:bg-stone-700 dark:hover:bg-stone-700"
  const inactiveStyle = "bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"

  const listButton = (
    <Button color="light" icon={listIcon} className={cn(active !== "list" ? inactiveStyle : activeStyle)}>
      <Text className="text-sm">Liste</Text>
    </Button>
  )

  const calendarButton = (
    <Button color="light" icon={calendarIcon} className={cn(active !== "cal" ? inactiveStyle : activeStyle)}>
      <Text className="text-sm">Kalender</Text>
    </Button>
  )

  return (
    <div className="w-fit z-2 border border-gray-200 dark:border-none dark:bg-stone-800 flex flex-row items-center rounded-lg p-1">
      {active === "list" ? (
        listButton
      ) : (
        <Link href="/arrangementer" className="w-full text-gray-800 hover:text-black">
          {listButton}
        </Link>
      )}
      {active === "cal" ? (
        calendarButton
      ) : (
        <Link href="/arrangementer/kalender" className="w-full text-gray-800 hover:text-black">
          {calendarButton}
        </Link>
      )}
    </div>
  )
}
