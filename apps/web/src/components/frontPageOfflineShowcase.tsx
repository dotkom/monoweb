import { Button, Text, Title } from "@dotkomonline/ui"
import type { Offline } from "@dotkomonline/rpc/offline"
import { IconArrowRight } from "@tabler/icons-react"
import { getYear } from "date-fns"
import { Link } from "@/components/link"
import { OfflineCard } from "./molecules/OfflineCard"

interface Props {
  offline: Offline
}

export const FrontPageOfflineShowcase = ({ offline }: Props) => (
  <>
    <MobileOfflineShowcase offline={offline} />
    <DesktopOfflineShowcase offline={offline} />
  </>
)

/** Mobile layout: title and year, the cover, and a link to earlier issues */
const MobileOfflineShowcase = ({ offline }: Props) => (
  <div className="md:hidden flex flex-col items-center gap-4 p-6 mx-4 mb-16 bg-indigo-100 dark:bg-neutral-800 rounded-2xl">
    <div className="self-stretch min-w-0 flex flex-col gap-2">
      <Title className="text-2xl font-semibold">{offline.title}</Title>
      <Title className="text-lg font-bold">{getYear(offline.publishedAt)}</Title>
    </div>

    <div className="w-40 shrink-0">
      <OfflineCard offline={offline} showTitle={false} />
    </div>

    <Button className="bg-transparent border-0" size="lg" element={Link} href="/offline">
      Les tidligere utgaver
    </Button>
  </div>
)

const DesktopOfflineShowcase = ({ offline }: Props) => {
  return (
    <div className="hidden md:flex flex-row items-center justify-between gap-12 p-10 rounded-2xl bg-indigo-100 dark:bg-neutral-800">
      <div className="flex flex-col gap-3 min-w-0 max-w-xl">
        <Text className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-stone-300">
          Nyeste utgave av Offline · {getYear(offline.publishedAt)}
        </Text>

        <Title className="text-4xl font-bold wrap-break-word">{offline.title}</Title>

        <Text className="text-gray-700 dark:text-stone-200">
          Offline er Onlines eget tidsskrift. Det gis ut to ganger i semesteret og inneholder en fin blanding av
          underholdende og opplysende saker for informatikkstudenter.
        </Text>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="default" size="lg" element="a" href={offline.fileUrl}>
            Les utgaven
          </Button>
          <Button
            variant="ghost"
            size="lg"
            element={Link}
            href="/offline"
            iconRight={<IconArrowRight className="size-4" />}
          >
            Tidligere utgaver
          </Button>
        </div>
      </div>

      <div className="md:w-48 lg:w-64 shrink-0">
        <OfflineCard offline={offline} showTitle={false} className="max-w-none" />
      </div>
    </div>
  )
}
