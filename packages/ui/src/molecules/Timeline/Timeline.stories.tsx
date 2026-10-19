import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { Fragment } from "react"
import { Badge } from "../../atoms/Badge/Badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../atoms/Collapsible/Collapsible"
import { Text } from "../../atoms/Typography/Text"
import { Title } from "../../atoms/Typography/Title"
import { cn } from "../../utils"
import { groupTimelineEntries, type TimelineGroupBy, type TimelineSortOrder } from "./group-timeline-entries"
import {
  Timeline,
  type TimelineColor,
  TimelineContent,
  TimelineDot,
  TimelineGroupHeader,
  type TimelineGroupHeaderPosition,
  TimelineItem,
  type TimelineOrientation,
  TimelineSideLabel,
} from "./Timeline"

type SampleEvent = {
  date: Date
  title: string
  description: string
}

const sampleEvents: SampleEvent[] = [
  {
    date: new Date("2026-08-11T10:00:00"),
    title: "Immatrikulering",
    description: "Velkomst og informasjon på Gløshaugen.",
  },
  {
    date: new Date("2026-08-11T14:30:00"),
    title: "Gruppeaktivitet",
    description: "Bli kjent med faddergruppen din.",
  },
  {
    date: new Date("2026-09-02T11:00:00"),
    title: "Campus-runde",
    description: "Omvisning på campus og IT-bygget.",
  },
]

type TimelineExampleState = {
  label: string
  showRailStubs?: boolean
  showSideLabels?: boolean
  groupBy?: TimelineGroupBy
  groupHeaderPosition?: TimelineGroupHeaderPosition
  responsiveLabels?: boolean
  richContent?: boolean
  sortOrder?: TimelineSortOrder
}

const exampleStates: TimelineExampleState[] = [
  { label: "With rail stubs" },
  { label: "Without rail stubs", showRailStubs: false },
  { label: "With side labels", showSideLabels: true },
  { label: "Side labels without rail stubs", showSideLabels: true, showRailStubs: false },
  { label: "Grouped by day", groupBy: "day", showSideLabels: true },
  { label: "Grouped without rail stubs", groupBy: "day", showSideLabels: true, showRailStubs: false },
  { label: "Group labels in content", groupBy: "day", groupHeaderPosition: "content" },
  {
    label: "Responsive labels",
    groupBy: "day",
    groupHeaderPosition: "responsive",
    responsiveLabels: true,
  },
  { label: "Grouped by week", groupBy: "week", showSideLabels: true },
  { label: "Grouped by month", groupBy: "month", showSideLabels: true },
  { label: "Newest first", groupBy: "day", showSideLabels: true, sortOrder: "desc" },
  { label: "Rich content", groupBy: "day", showSideLabels: true, richContent: true },
]

const colors: TimelineColor[] = ["brand", "gray"]

const EventSummary = ({ event, richContent }: { event: SampleEvent; richContent?: boolean }) => {
  if (richContent) {
    return (
      <Collapsible className="rounded-xl border border-border p-3">
        <CollapsibleTrigger className="flex w-full flex-col items-start gap-2 text-left">
          <Badge color="gray">Faddergruppe</Badge>
          <Text className="font-medium">{event.title}</Text>
          <Text size="sm" className="text-muted-foreground">
            Vis detaljer
          </Text>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Text size="sm" className="pt-2 text-muted-foreground">
            {event.description}
          </Text>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <Text className="font-medium">{event.title}</Text>
      <Text size="sm" className="text-muted-foreground">
        {event.description}
      </Text>
    </div>
  )
}

const TimelineExample = ({
  orientation,
  color,
  showRailStubs = true,
  showSideLabels = false,
  groupBy,
  groupHeaderPosition = "side",
  responsiveLabels = false,
  richContent = false,
  sortOrder,
}: Omit<TimelineExampleState, "label"> & { orientation: TimelineOrientation; color: TimelineColor }) => (
  <Timeline orientation={orientation} color={color} showRailStubs={showRailStubs}>
    {groupTimelineEntries(sampleEvents, { groupBy, sortOrder }).map((group) => (
      <Fragment key={group.key}>
        {groupBy !== undefined && (
          <TimelineGroupHeader position={groupHeaderPosition}>{group.label}</TimelineGroupHeader>
        )}
        {group.entries.map((event) => (
          <TimelineItem key={event.date.getTime()}>
            {(showSideLabels || responsiveLabels) && (
              <TimelineSideLabel className={cn(responsiveLabels && "max-sm:hidden")}>{event.marker}</TimelineSideLabel>
            )}
            <TimelineDot />
            <TimelineContent>
              {(!showSideLabels || responsiveLabels) && (
                <Text
                  className={cn(
                    "pb-1 font-medium text-muted-foreground text-xs",
                    responsiveLabels && "leading-6 sm:hidden"
                  )}
                >
                  {format(event.date, "dd. MMM 'kl.' HH:mm", { locale: nb })}
                </Text>
              )}
              <EventSummary event={event} richContent={richContent} />
            </TimelineContent>
          </TimelineItem>
        ))}
      </Fragment>
    ))}
  </Timeline>
)

const TimelineGallery = ({ orientation }: { orientation: TimelineOrientation }) => (
  <div className="flex w-full max-w-6xl flex-col gap-10">
    {exampleStates.map(({ label, ...exampleProperties }) => (
      <section key={label} className="flex flex-col gap-4">
        <Title element="h2" size="sm">
          {label}
        </Title>
        <div className={cn("grid grid-cols-1 items-start gap-6", orientation === "vertical" && "md:grid-cols-2")}>
          {colors.map((color) => (
            <div key={color} className="flex min-w-0 flex-col gap-3">
              <Text className="font-medium text-muted-foreground text-sm capitalize">{color}</Text>
              <TimelineExample orientation={orientation} color={color} {...exampleProperties} />
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
)

export default {
  title: "Timeline",
  component: Timeline,
}

export const Vertical = () => <TimelineGallery orientation="vertical" />

export const Horizontal = () => <TimelineGallery orientation="horizontal" />
