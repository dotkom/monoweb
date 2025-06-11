import { server } from "@/utils/trpc/server"
import type { Offline } from "@dotkomonline/types"
import { Text, Title } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"

const OfflinePage = async () => {
  const offlines = await server.offline.all.query()

  const offlinesByYear = offlines
    .sort((a, b) => b.published.getTime() - a.published.getTime())
    .reduce<Record<number, Offline[]>>((acc, offline) => {
      const year = offline.published.getFullYear()

      acc[year] ??= []
      acc[year].push(offline)

      return acc
    }, {})

  return (
    <div>
      <div className="border-slate-7 border-b flex flex-col pb-5">
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

interface OfflineYearSectionProps {
  offlines: Offline[]
  year: string
}

const OfflineYearSection = ({ offlines, year }: OfflineYearSectionProps) => {
  return (
    <div className="mt-8">
      <Title size="lg" element="h2" className="border-l-4 border-slate-6 pl-3 mb-2 font-semibold w-fit mx-auto sm:mx-0">
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

interface OfflineCardProps {
  offline: Offline
}

const OfflineCard = ({ offline }: OfflineCardProps) => {
  return (
    <div className="flex flex-col gap-3 text-wrap w-56">
      {offline.imageUrl && offline.fileUrl && (
        <Link href={offline.fileUrl}>
          <Image
            src={offline.imageUrl}
            width={200}
            height={250}
            alt={offline.title}
            className="rounded cursor-pointer w-auto transition-transform duration-200 hover:scale-105 shadow-sm hover:shadow-md"
          />
        </Link>
      )}
      <Text className="text-slate-11">{offline.title}</Text>
    </div>
  )
}

export default OfflinePage
