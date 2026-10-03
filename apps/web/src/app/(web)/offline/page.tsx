import { OfflineCard } from "@/components/molecules/OfflineCard"
import { server } from "@/utils/trpc/server"
import type { Offline } from "@dotkomonline/rpc/offline"
import { Text, Title } from "@dotkomonline/ui"
import { IconArrowUpRight } from "@tabler/icons-react"
import Link from "next/link"

const OfflinePage = async () => {
  const offlines = await server.offline.all.query({ take: 1000 })
  const offlinesByYear = groupOfflinesByYear(offlines)

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Title element="h1" className="text-3xl">
            Offline
          </Title>

          <Text className="text-gray-600 dark:text-stone-300">
            Offline er Online sitt eget tidsskrift. Det gis ut to ganger i semesteret og inneholder en fin blanding av
            underholdende og opplysende saker for informatikkstudenter.
          </Text>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-stone-300 flex-wrap">
          <span>Offline blir utgitt av Redaksjonen.</span>
          <Link
            href="/grupper/redaksjonen"
            className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 transition-colors"
          >
            <span>Les mer om Redaksjonen her</span>
            <IconArrowUpRight className="size-4" />
          </Link>
        </div>
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
