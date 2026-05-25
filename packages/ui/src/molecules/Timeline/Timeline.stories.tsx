import { Badge } from "../../atoms/Badge/Badge"
import { Text } from "../../atoms/Typography/Text"
import { Title } from "../../atoms/Typography/Title"
import { Timeline } from "./Timeline"

const sampleEntries = [
  {
    date: new Date("2026-08-11T10:00:00"),
    leftContent: (
      <Badge color="slate" variant="light">
        Faddergruppe
      </Badge>
    ),
    rightContent: (
      <div className="flex flex-col gap-1">
        <Text className="font-medium">Immatrikulering</Text>
        <Text size="sm" className="text-gray-500 dark:text-stone-400">
          Møt opp i Gløshaugen for velkomst og informasjon.
        </Text>
      </div>
    ),
  },
  {
    date: new Date("2026-08-11T14:30:00"),
    leftContent: (
      <Badge color="slate" variant="light">
        Faddergruppe
      </Badge>
    ),
    rightContent: (
      <div className="flex flex-col gap-1">
        <Text className="font-medium">Gruppeaktivitet</Text>
        <Text size="sm" className="text-gray-500 dark:text-stone-400">
          Bli kjent med faddergruppen din.
        </Text>
      </div>
    ),
  },
  {
    date: new Date("2026-08-11T18:00:00"),
    rightContent: (
      <div className="flex flex-col gap-1">
        <Text className="font-medium">Kveldsarrangement</Text>
        <Text size="sm" className="text-gray-500 dark:text-stone-400">
          Felles middag og quiz.
        </Text>
      </div>
    ),
  },
  {
    date: new Date("2026-08-12T11:00:00"),
    rightContent: (
      <div className="flex flex-col gap-1">
        <Text className="font-medium">Campus-runde</Text>
        <Text size="sm" className="text-gray-500 dark:text-stone-400">
          Omvisning på Gløshaugen og IT-bygget.
        </Text>
      </div>
    ),
  },
  {
    date: new Date("2026-08-19T16:00:00"),
    rightContent: (
      <div className="flex flex-col gap-1">
        <Text className="font-medium">Linjeforeningsfest</Text>
        <Text size="sm" className="text-gray-500 dark:text-stone-400">
          Avslutning av fadderukene.
        </Text>
      </div>
    ),
  },
]

export default {
  title: "Timeline",
  component: Timeline,
}

export const Default = () => (
  <div className="max-w-3xl">
    <Timeline entries={sampleEntries} />
  </div>
)

export const WithoutLeftContent = () => (
  <div className="max-w-3xl">
    <Timeline
      entries={sampleEntries.map(({ date, rightContent }) => ({
        date,
        rightContent,
      }))}
    />
  </div>
)

export const Descending = () => (
  <div className="max-w-3xl">
    <Timeline entries={sampleEntries} sortOrder="desc" />
  </div>
)

export const GroupByWeek = () => (
  <div className="max-w-3xl">
    <Timeline entries={sampleEntries} groupBy="week" />
  </div>
)

export const GroupByMonth = () => (
  <div className="max-w-3xl">
    <Timeline entries={sampleEntries} groupBy="month" />
  </div>
)

export const GroupByYear = () => (
  <div className="max-w-3xl">
    <Timeline
      entries={[
        ...sampleEntries,
        {
          date: new Date("2025-12-01T12:00:00"),
          rightContent: <Text className="font-medium">Julebord</Text>,
        },
      ]}
      groupBy="year"
    />
  </div>
)

export const LabelAfterDot = () => (
  <div className="max-w-xl">
    <Title element="h3" className="mb-4">
      Responsive layout
    </Title>
    <Timeline entries={sampleEntries} labelPosition="after-dot" />
  </div>
)

export const LabelBeforeDot = () => (
  <div className="max-w-3xl">
    <Timeline entries={sampleEntries} labelPosition="before-dot" />
  </div>
)
