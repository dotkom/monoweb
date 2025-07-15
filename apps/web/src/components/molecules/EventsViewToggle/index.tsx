import { Button, Icon, Text, cn } from "@dotkomonline/ui"
import Link from "next/link"
import type { FC } from "react"

interface EventsViewToggleProps {
  active: "list" | "cal"
}

export const EventsViewToggle: FC<EventsViewToggleProps> = ({ active }) => {
  const listIcon = <Icon icon="tabler:layout-list" className="text-sm" />
  const calendarIcon = <Icon icon="tabler:calendar-month" className="text-sm" />

  const listButton = (
    <Button
      color="light"
      icon={listIcon}
      className={cn(active !== "list" ? "bg-transparent hover:bg-transparent" : "")}
    >
      <Text className="text-sm">Liste</Text>
    </Button>
  )

  const calendarButton = (
    <Button
      color="light"
      icon={calendarIcon}
      className={cn(active !== "cal" ? "bg-transparent hover:bg-transparent" : "")}
    >
      <Text className="text-sm">Kalender</Text>
    </Button>
  )

  return (
    <div className="w-full sm:w-fit border border-slate-200 flex flex-row items-center rounded-lg p-1">
      {active === "list" ? (
        listButton
      ) : (
        <Link href="/arrangementer" className="w-full text-slate-800 hover:text-black">
          {listButton}
        </Link>
      )}
      {active === "cal" ? (
        calendarButton
      ) : (
        <Link href="/arrangementer/kalender" className="w-full text-slate-800 hover:text-black">
          {calendarButton}
        </Link>
      )}
    </div>
  )
}
