import Link from "next/link";
import { Icon } from "@dotkomonline/ui";

interface EventsViewToggleProps {
  active: "list" | "cal";
}

const EventsViewToggle: React.FC<EventsViewToggleProps> = ({ active }) => {
  return (
    <div className="text-foreground bg-slate-3 inline-flex items-center justify-center rounded-md p-1 my-4">
      {active === "list" ? (
        <div className="text-slate-12 bg-slate-2 shadow-sm inline-flex items-center justify-center rounded-[0.185rem] px-4 py-1.5">
          <Icon icon="tabler:layout-list" width={20} height={20} />
        </div>
      ) : (
        <Link
          href="/events"
          className="text-slate-9 inline-flex items-center justify-center rounded-[0.185rem] px-4 py-1.5 transition-all cursor-pointer hover:text-slate-12"
        >
          <Icon icon="tabler:layout-list" width={20} height={20} />
        </Link>
      )}
      {active === "cal" ? (
        <div className="text-slate-12 bg-slate-2 shadow-sm inline-flex items-center justify-center rounded-[0.185rem] px-4 py-1.5">
          <Icon icon="tabler:calendar-month" width={20} height={20} />
        </div>
      ) : (
        <Link
          href="/events/calendar"
          className="text-slate-9 inline-flex items-center justify-center rounded-[0.185rem] px-4 py-1.5 transition-all cursor-pointer hover:text-slate-12"
        >
          <Icon icon="tabler:calendar-month" width={20} height={20} />
        </Link>
      )}
    </div>
  );
};

export default EventsViewToggle;