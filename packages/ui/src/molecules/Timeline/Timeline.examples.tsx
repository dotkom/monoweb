import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { IconLockFilled, IconPennantFilled, IconSquareRotatedFilled } from "@tabler/icons-react"
import { Fragment, type ReactNode } from "react"
import { Badge } from "../../atoms/Badge/Badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../atoms/Collapsible/Collapsible"
import { Text } from "../../atoms/Typography/Text"
import { Title } from "../../atoms/Typography/Title"
import { cn } from "../../utils"
import { groupTimelineEntries, type TimelineGroupBy, type TimelineSortOrder } from "./group-timeline-entries"
import {
  Timeline,
  type TimelineBleed,
  type TimelineColor,
  TimelineContent,
  TimelineDot,
  TimelineGroupHeader,
  type TimelineGroupHeaderPosition,
  TimelineItem,
  type TimelineItemAlignment,
  type TimelineOrientation,
  type TimelineRail,
  TimelineSideLabel,
} from "./Timeline"

type SampleEvent = {
  date: Date
  title: string
  description: string
  icon: ReactNode
}

const sampleEvents: SampleEvent[] = [
  {
    date: new Date("2026-08-11T10:00:00"),
    title: "Immatrikulering",
    description: "Velkomst og informasjon på Gløshaugen.",
    icon: <IconPennantFilled className="size-5" />,
  },
  {
    date: new Date("2026-08-11T14:30:00"),
    title: "Gruppeaktivitet",
    description: "Bli kjent med faddergruppen din.",
    icon: <IconSquareRotatedFilled className="size-5" />,
  },
  {
    date: new Date("2026-09-02T11:00:00"),
    title: "Campus-runde",
    description: "Omvisning på campus og IT-bygget.",
    icon: <IconLockFilled className="size-5" />,
  },
]

export type TimelineExampleState = {
  label: string
  showRailStubs?: boolean
  rail?: TimelineRail
  showSideLabels?: boolean
  groupBy?: TimelineGroupBy
  groupHeaderPosition?: TimelineGroupHeaderPosition
  responsiveLabels?: boolean
  richContent?: boolean
  sortOrder?: TimelineSortOrder
  alignments?: TimelineItemAlignment[]
  horizontalOnly?: boolean
  bleed?: TimelineBleed
  showCustomMarkers?: boolean
}

export const timelineExamples = {
  colors: [{ label: "Brand and gray" }],
  rail: [
    { label: "With rail stubs" },
    { label: "Without rail stubs", showRailStubs: false },
    { label: "Segmented rail", rail: "segmented", showSideLabels: true },
    { label: "Segmented rail with custom markers", rail: "segmented", showCustomMarkers: true, showSideLabels: true },
    { label: "Segmented rail with group labels", rail: "segmented", showCustomMarkers: true, groupBy: "day" },
    {
      label: "Segmented rail with mixed alignment",
      rail: "segmented",
      showCustomMarkers: true,
      showSideLabels: true,
      alignments: ["start", "center", "end"],
      horizontalOnly: true,
    },
  ],
  labels: [
    { label: "Labels in content" },
    { label: "Side labels", showSideLabels: true },
    { label: "Side labels without rail stubs", showSideLabels: true, showRailStubs: false },
    {
      label: "Responsive labels",
      groupBy: "day",
      groupHeaderPosition: "responsive",
      responsiveLabels: true,
    },
  ],
  bleed: [
    { label: "Bleeding start", bleed: "start" },
    { label: "Bleeding start without rail stubs", bleed: "start", showRailStubs: false },
    { label: "Bleeding end", bleed: "end", alignments: ["start", "center", "end"] },
    {
      label: "Bleeding end without rail stubs",
      bleed: "end",
      showRailStubs: false,
      alignments: ["start", "center", "end"],
    },
    { label: "Bleeding both ends", bleed: "both", alignments: ["start", "center", "end"] },
    {
      label: "Bleeding both ends without rail stubs",
      bleed: "both",
      showRailStubs: false,
      alignments: ["start", "center", "end"],
    },
    { label: "Bleeding both ends with side labels", bleed: "both", showSideLabels: true },
    { label: "Bleeding both ends with group labels", bleed: "both", showSideLabels: true, groupBy: "day" },
    { label: "Bleeding both ends with custom markers", bleed: "both", showCustomMarkers: true, showSideLabels: true },
  ],
  customMarkers: [
    { label: "Custom markers", showCustomMarkers: true, showSideLabels: true },
    { label: "Custom markers without rail stubs", showCustomMarkers: true, showSideLabels: true, showRailStubs: false },
    {
      label: "Custom markers with mixed alignment",
      showCustomMarkers: true,
      showSideLabels: true,
      alignments: ["start", "center", "end"],
      horizontalOnly: true,
    },
    {
      label: "Custom markers with mixed alignment without rail stubs",
      showCustomMarkers: true,
      showSideLabels: true,
      showRailStubs: false,
      alignments: ["start", "center", "end"],
      horizontalOnly: true,
    },
  ],
  grouping: [
    { label: "Grouped by day", groupBy: "day", showSideLabels: true },
    { label: "Grouped without rail stubs", groupBy: "day", showSideLabels: true, showRailStubs: false },
    { label: "Group labels in content", groupBy: "day", groupHeaderPosition: "content" },
    { label: "Grouped by week", groupBy: "week", showSideLabels: true },
    { label: "Grouped by month", groupBy: "month", showSideLabels: true },
  ],
  sorting: [
    { label: "Oldest first", groupBy: "day", showSideLabels: true, sortOrder: "asc" },
    { label: "Newest first", groupBy: "day", showSideLabels: true, sortOrder: "desc" },
  ],
  richContent: [{ label: "Expandable content", groupBy: "day", showSideLabels: true, richContent: true }],
  alignment: [
    { label: "Centered entries", alignments: ["center"], showSideLabels: true },
    {
      label: "Centered entries without rail stubs",
      alignments: ["center"],
      showSideLabels: true,
      showRailStubs: false,
    },
    { label: "End-aligned entries", alignments: ["end"], showSideLabels: true },
    {
      label: "End-aligned entries without rail stubs",
      alignments: ["end"],
      showSideLabels: true,
      showRailStubs: false,
    },
    { label: "Start, center, end", alignments: ["start", "center", "end"] },
    { label: "Start, center, end without rail stubs", alignments: ["start", "center", "end"], showRailStubs: false },
  ],
} satisfies Record<string, TimelineExampleState[]>

const overviewExamples: (TimelineExampleState & { color: TimelineColor })[] = [
  { label: "Brand with rail stubs", color: "brand" },
  { label: "Gray with side labels", color: "gray", showSideLabels: true, showRailStubs: false },
  {
    label: "Custom markers and segmented rail",
    color: "brand",
    rail: "segmented",
    showCustomMarkers: true,
    showSideLabels: true,
  },
  {
    label: "Groups, responsive labels and newest first",
    color: "gray",
    groupBy: "day",
    groupHeaderPosition: "responsive",
    responsiveLabels: true,
    sortOrder: "desc",
  },
  {
    label: "Bleeding both ends",
    color: "brand",
    bleed: "both",
    alignments: ["start", "center", "end"],
    showSideLabels: true,
  },
  { label: "Expandable content", color: "gray", richContent: true, showSideLabels: true },
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
  rail,
  showSideLabels = false,
  groupBy,
  groupHeaderPosition = "side",
  responsiveLabels = false,
  richContent = false,
  sortOrder,
  alignments,
  bleed,
  showCustomMarkers = false,
}: Omit<TimelineExampleState, "label"> & { orientation: TimelineOrientation; color: TimelineColor }) => (
  <Timeline orientation={orientation} color={color} showRailStubs={showRailStubs} rail={rail} bleed={bleed}>
    {groupTimelineEntries(sampleEvents, { groupBy, sortOrder }).map((group) => (
      <Fragment key={group.key}>
        {groupBy !== undefined && (
          <TimelineGroupHeader position={groupHeaderPosition}>{group.label}</TimelineGroupHeader>
        )}
        {group.entries.map((event) => {
          const eventIndex = sampleEvents.findIndex(
            (sampleEvent) => sampleEvent.date.getTime() === event.date.getTime()
          )
          const alignment = alignments?.[eventIndex] ?? alignments?.[0]

          return (
            <TimelineItem key={event.date.getTime()} align={alignment}>
              {(showSideLabels || responsiveLabels) && (
                <TimelineSideLabel className={cn(responsiveLabels && "max-sm:hidden")}>
                  {event.marker}
                </TimelineSideLabel>
              )}
              <TimelineDot
                render={showCustomMarkers ? event.icon : undefined}
                size={showCustomMarkers ? 20 : 12}
                className={cn(
                  showCustomMarkers && "text-(--timeline-color)",
                  showCustomMarkers && rail !== "segmented" && "bg-background"
                )}
              />
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
          )
        })}
      </Fragment>
    ))}
  </Timeline>
)

const TimelineExampleFrame = ({
  bleed,
  ...exampleProperties
}: Omit<TimelineExampleState, "label"> & { orientation: TimelineOrientation; color: TimelineColor }) => (
  <div className={cn("min-w-0", bleed && "p-4")}>
    <div className={cn("flex min-w-0 flex-col", bleed && "outline outline-border outline-dashed")}>
      <TimelineExample bleed={bleed} {...exampleProperties} />
    </div>
  </div>
)

export const TimelineGallery = ({
  orientation,
  examples,
}: {
  orientation: TimelineOrientation
  examples: TimelineExampleState[]
}) => (
  <div className="flex w-full max-w-6xl flex-col gap-10">
    {examples
      .filter((exampleState) => orientation === "horizontal" || !exampleState.horizontalOnly)
      .map(({ label, ...exampleProperties }) => (
        <section key={label} className="flex flex-col gap-4">
          <Title element="h2" size="sm">
            {label}
          </Title>
          <div className={cn("grid grid-cols-1 items-start gap-6", orientation === "vertical" && "md:grid-cols-2")}>
            {colors.map((color) => (
              <div key={color} className="flex min-w-0 flex-col gap-3">
                <Text className="font-medium text-muted-foreground text-sm capitalize">{color}</Text>
                <TimelineExampleFrame orientation={orientation} color={color} {...exampleProperties} />
              </div>
            ))}
          </div>
        </section>
      ))}
  </div>
)

export const TimelineOverview = ({ orientation }: { orientation: TimelineOrientation }) => (
  <div
    className={cn(
      "grid w-full max-w-6xl grid-cols-1 items-start gap-10",
      orientation === "vertical" && "md:grid-cols-2"
    )}
  >
    {overviewExamples.map(({ label, ...exampleProperties }) => (
      <section key={label} className="flex min-w-0 flex-col gap-4">
        <Title element="h2" size="sm">
          {label}
        </Title>
        <TimelineExampleFrame orientation={orientation} {...exampleProperties} />
      </section>
    ))}
  </div>
)
