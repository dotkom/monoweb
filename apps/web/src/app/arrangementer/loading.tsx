import { EventListItemSkeleton } from "@/components/molecules/EventListItem/EventListItem"
import { EventsViewToggle } from "@/components/molecules/EventsViewToggle/index"
import { Title } from "@dotkomonline/ui"

export default () => {
  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Arrangementer
      </Title>

      <EventsViewToggle active="list" />

      <div className="flex flex-col gap-1">
        <EventListItemSkeleton />
        <EventListItemSkeleton />
        <EventListItemSkeleton />
        <EventListItemSkeleton />
        <EventListItemSkeleton />
        <EventListItemSkeleton />
        <EventListItemSkeleton />
        <EventListItemSkeleton />
      </div>
    </div>
  )
}
