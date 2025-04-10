import { Icon } from "@dotkomonline/ui"
import Link from "next/link"
import type { FC } from "react"

interface EventsViewToggleProps {
  active: "list" | "cal"
}

export const EventsViewToggle: FC<EventsViewToggleProps> = ({ active }) => {
  return (
    <div className="w-full sm:w-fit text-foreground bg-slate-3 inline-flex items-center justify-center rounded-md p-1 my-4">
      {active === "list" ? (
        <div className="w-full text-slate-12 bg-slate-2 shadow-sm flex gap-1 items-center justify-center rounded-[0.185rem] px-4 py-1.5">
          <Icon icon="tabler:layout-list" width={20} height={20} />
          <span>Liste</span>
        </div>
      ) : (
        <Link
          href="/events"
          className="w-full text-slate-9 flex gap-1 items-center justify-center rounded-[0.185rem] px-4 py-1.5 transition-all cursor-pointer hover:text-slate-12"
        >
          <Icon icon="tabler:layout-list" width={20} height={20} />
          <span>Liste</span>
        </Link>
      )}
      {active === "cal" ? (
        <div className="w-full text-slate-12 bg-slate-2 shadow-sm flex gap-1 items-center justify-center rounded-[0.185rem] px-4 py-1.5">
          <Icon icon="tabler:calendar-month" width={20} height={20} />
          <span>Kalender</span>
        </div>
      ) : (
        <Link
          href="/events/calendar"
          className="w-full text-slate-9 flex gap-1 items-center justify-center rounded-[0.185rem] px-4 py-1.5 transition-all cursor-pointer hover:text-slate-12"
        >
          <Icon icon="tabler:calendar-month" width={20} height={20} />
          <span>Kalender</span>
        </Link>
      )}
    </div>
  )
}
