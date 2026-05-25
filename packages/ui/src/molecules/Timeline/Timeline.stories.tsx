import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { Fragment } from "react"
import { Badge } from "../../atoms/Badge/Badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../atoms/Collapsible/Collapsible"
import { Text } from "../../atoms/Typography/Text"
import { Title } from "../../atoms/Typography/Title"
import { groupTimelineEntries } from "./group-timeline-entries"
import {
  Timeline,
  TimelineContent,
  TimelineGroupHeader,
  TimelineDot,
  TimelineItem,
  TimelineSideLabel,
} from "./Timeline"

type SampleEvent = {
  date: Date
  title: string
  description: string
  badge?: string
}

const sampleEvents: SampleEvent[] = [
  {
    date: new Date("2026-08-11T10:00:00"),
    title: "Immatrikulering",
    description: "Møt opp på Gløshaugen for velkomst og informasjon.",
    badge: "Faddergruppe",
  },
  {
    date: new Date("2026-08-11T14:30:00"),
    title: "Gruppeaktivitet",
    description: "Bli kjent med faddergruppen din.",
    badge: "Faddergruppe",
  },
  {
    date: new Date("2026-08-11T18:00:00"),
    title: "Kveldsarrangement",
    description: "Felles middag og quiz.",
  },
  {
    date: new Date("2026-08-12T11:00:00"),
    title: "Campus-runde",
    description: "Omvisning på Gløshaugen og IT-bygget.",
  },
  {
    date: new Date("2026-08-19T16:00:00"),
    title: "Linjeforeningsfest",
    description: "Avslutning av fadderukene.",
  },
]

const EventSummary = ({ event }: { event: SampleEvent }) => (
  <div className="flex flex-col gap-1">
    <Text className="font-medium">{event.title}</Text>
    <Text size="sm" className="text-muted-foreground">
      {event.description}
    </Text>
  </div>
)

export default {
  title: "Timeline",
  component: Timeline,
}

export const Default = () => (
  <div className="max-w-xl">
    <Timeline>
      {sampleEvents.map((event) => (
        <TimelineItem key={event.date.getTime()}>
          <TimelineDot />
          <TimelineContent>
            <Text className="pb-1 font-medium text-muted-foreground text-xs">
              {format(event.date, "dd. MMM 'kl.' HH:mm", { locale: nb })}
            </Text>
            <EventSummary event={event} />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  </div>
)

export const GroupedByDay = () => (
  <div className="max-w-3xl">
    <Timeline>
      {groupTimelineEntries(sampleEvents).map((group) => (
        <Fragment key={group.key}>
          <TimelineGroupHeader>{group.label}</TimelineGroupHeader>

          {group.entries.map((entry) => (
            <TimelineItem key={entry.date.getTime()}>
              <TimelineSideLabel>{entry.marker}</TimelineSideLabel>
              <TimelineDot />
              <TimelineContent>
                <EventSummary event={entry} />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Fragment>
      ))}
    </Timeline>
  </div>
)

export const LabelsAboveContent = () => (
  <div className="max-w-xl">
    <Timeline>
      {groupTimelineEntries(sampleEvents).map((group) => (
        <Fragment key={group.key}>
          <TimelineGroupHeader position="content">{group.label}</TimelineGroupHeader>

          {group.entries.map((entry) => (
            <TimelineItem key={entry.date.getTime()}>
              <TimelineDot />
              <TimelineContent>
                <Text className="pb-1 font-medium text-muted-foreground text-xs">{entry.marker}</Text>
                <EventSummary event={entry} />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Fragment>
      ))}
    </Timeline>
  </div>
)

export const Responsive = () => (
  <div className="max-w-3xl">
    <Timeline>
      {groupTimelineEntries(sampleEvents).map((group) => (
        <Fragment key={group.key}>
          <TimelineGroupHeader position="responsive">{group.label}</TimelineGroupHeader>

          {group.entries.map((entry) => (
            <TimelineItem key={entry.date.getTime()}>
              <TimelineSideLabel className="max-sm:hidden">{entry.marker}</TimelineSideLabel>
              <TimelineDot />
              <TimelineContent>
                <Text className="pb-1 font-medium text-muted-foreground text-xs leading-6 sm:hidden">
                  {entry.marker}
                </Text>
                <EventSummary event={entry} />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Fragment>
      ))}
    </Timeline>
  </div>
)

export const FreeformContent = () => (
  <div className="max-w-3xl">
    <Timeline>
      <TimelineGroupHeader>11. aug</TimelineGroupHeader>

      <TimelineItem>
        <TimelineSideLabel>10:00</TimelineSideLabel>
        <TimelineDot />
        <TimelineContent>
          <div className="flex flex-row gap-3 rounded-xl border border-gray-200 p-3 dark:border-stone-700">
            <div className="aspect-video h-20 shrink-0 rounded-lg bg-gray-300 dark:bg-stone-600" />
            <div className="flex min-w-0 flex-col gap-1">
              <Title element="h3" size="sm" className="font-normal">
                Immatrikulering
              </Title>
              <Text size="sm" className="text-muted-foreground">
                Møt opp på Gløshaugen for velkomst og informasjon.
              </Text>
              <Badge color="gray">Faddergruppe</Badge>
            </div>
          </div>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem>
        <TimelineSideLabel>14:30</TimelineSideLabel>
        <TimelineDot />
        <TimelineContent>
          <Collapsible className="rounded-xl border border-gray-200 p-3 dark:border-stone-700">
            <CollapsibleTrigger className="w-full text-left">
              <Text className="font-medium">Gruppeaktivitet (klikk for detaljer)</Text>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-2 pt-2">
                <Text size="sm" className="text-muted-foreground">
                  Bli kjent med faddergruppen din. Vi møtes utenfor hovedbygget og går samlet til aktivitetsområdet.
                </Text>
                <Text size="sm" className="text-muted-foreground">
                  Ta med godt humør og klær etter været. Arrangementet varer i omtrent tre timer.
                </Text>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TimelineContent>
      </TimelineItem>

      <TimelineItem>
        <TimelineSideLabel>18:00</TimelineSideLabel>
        <TimelineDot />
        <TimelineContent>
          <Text className="font-medium">Kveldsarrangement</Text>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  </div>
)

export const GroupedByWeek = () => (
  <div className="max-w-3xl">
    <Timeline>
      {groupTimelineEntries(sampleEvents, { groupBy: "week" }).map((group) => (
        <Fragment key={group.key}>
          <TimelineGroupHeader>{group.label}</TimelineGroupHeader>

          {group.entries.map((entry) => (
            <TimelineItem key={entry.date.getTime()}>
              <TimelineSideLabel>{entry.marker}</TimelineSideLabel>
              <TimelineDot />
              <TimelineContent>
                <EventSummary event={entry} />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Fragment>
      ))}
    </Timeline>
  </div>
)

export const GroupedByMonth = () => (
  <div className="max-w-3xl">
    <Timeline>
      {groupTimelineEntries(sampleEvents, { groupBy: "month" }).map((group) => (
        <Fragment key={group.key}>
          <TimelineGroupHeader>{group.label}</TimelineGroupHeader>

          {group.entries.map((entry) => (
            <TimelineItem key={entry.date.getTime()}>
              <TimelineSideLabel>{entry.marker}</TimelineSideLabel>
              <TimelineDot />
              <TimelineContent>
                <EventSummary event={entry} />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Fragment>
      ))}
    </Timeline>
  </div>
)

export const Descending = () => (
  <div className="max-w-3xl">
    <Timeline>
      {groupTimelineEntries(sampleEvents, { sortOrder: "desc" }).map((group) => (
        <Fragment key={group.key}>
          <TimelineGroupHeader>{group.label}</TimelineGroupHeader>

          {group.entries.map((entry) => (
            <TimelineItem key={entry.date.getTime()}>
              <TimelineSideLabel>{entry.marker}</TimelineSideLabel>
              <TimelineDot />
              <TimelineContent>
                <EventSummary event={entry} />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Fragment>
      ))}
    </Timeline>
  </div>
)
