import { OfflineCard } from "@/components/molecules/OfflineCard"
import { server } from "@/utils/trpc/server"
import type { Offline } from "@dotkomonline/types"
import { Text, Title } from "@dotkomonline/ui"

const OfflinePage = async () => {
  const offlines = await server.offline.all.query({ take: 1000 })
  const offlinesByYear = groupOfflinesByYear(offlines)

  return (
    <div>
      <div className="border-gray-600 border-b flex flex-col pb-5">
        <Title element="h1" className="text-3xl">
          Offline
        </Title>
        <Text className="pt-2">
          Offline er Online sitt eget tidsskrift. Det gis ut to ganger i semesteret og inneholder en fin blanding av
          underholdende og opplysende saker for informatikkstudenter.
        </Text>
      </div>

      {Object.entries(offlinesByYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, offlines]) => (
          <OfflineYearSection offlines={offlines} year={year} key={year} />
        ))}
    </div>
  )
}

function groupOfflinesByYear(offlines: Offline[]) {
  return offlines.reduce<Record<number, Offline[]>>((acc, offline) => {
    const year = offline.publishedAt.getFullYear()

    acc[year] ??= []
    acc[year].push(offline)

    return acc
  }, {})
}

interface OfflineYearSectionProps {
  offlines: Offline[]
  year: string
}

const OfflineYearSection = ({ offlines, year }: OfflineYearSectionProps) => {
  return (
    <div className="mt-8">
      <Title
        size="lg"
        element="h2"
        className="border-l-4 border-gray-500 pl-3 mb-2 font-semibold w-fit mx-auto sm:mx-0"
      >
        {year}
      </Title>

      <div className="flex flex-wrap gap-12 justify-center sm:justify-normal p-4">
        {offlines.map((offline) => (
          <OfflineCard offline={offline} key={offline.id} />
        ))}
      </div>
    </div>
  )
}

export default OfflinePage
