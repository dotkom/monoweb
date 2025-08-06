import { EventsViewToggle } from "@/components/molecules/EventsViewToggle/index"
import { Title } from "@dotkomonline/ui"
import { EventListSkeleton } from "./components/EventList"

export default () => {
  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <EventsViewToggle active="list" />
      <EventListSkeleton />
    </div>
  )
}
