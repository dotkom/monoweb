import type { Event } from "@dotkomonline/types"
import { Button, Text, Tilt, Title } from "@dotkomonline/ui"
import { IconEdit } from "@tabler/icons-react"
import Link from "next/link"
import type { FC } from "react"
import { PlaceHolderImage } from "@/components/atoms/PlaceHolderImage"
import { env } from "@/env"

interface Props {
  event: Event
  showDashboardLink: boolean
}

export const EventHeader: FC<Props> = ({ event, showDashboardLink }) => {
  const dashboardUrl = new URL(`/event/${event.id}`, env.NEXT_PUBLIC_DASHBOARD_URL).toString()

  return (
    <section className="flex flex-col gap-8">
      <Tilt
        scale={1}
        tiltMaxAngleX={0.25}
        tiltMaxAngleY={0.25}
        glareMaxOpacity={0.1}
        className="rounded-xl bg-gray-100 dark:bg-stone-800"
      >
        <div className="flex items-center justify-center aspect-[16/9] md:aspect-[24/9] w-full">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-contain rounded-xl" />
          ) : (
            <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
              <PlaceHolderImage
                width={16}
                height={9}
                variant={event.type}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          )}
        </div>
      </Tilt>

      <div className="flex flex-col gap-2 md:flex-row md:gap-4 md:items-center">
        <Title element="h1" size="xl" title={event.title} className="text-3xl sm:text-4xl sm:line-clamp-3">
          {event.title}
        </Title>
        {showDashboardLink && (
          <Button
            element={Link}
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="unstyled"
            className="w-fit p-1.5 bg-blue-100 hover:bg-blue-50 rounded-md transition-colors dark:bg-stone-700 dark:hover:bg-stone-600 gap-1.5"
            title="Rediger arrangement"
          >
            <IconEdit className="size-[1.25em] md:w-6 md:h-6" />
            <Text className="md:hidden">Rediger</Text>
          </Button>
        )}
      </div>
    </section>
  )
}

export const SkeletonEventHeader = () => (
  <div className="flex flex-col gap-8">
    <div className="w-full rounded-xl aspect-[16/9] md:aspect-[24/9] bg-gray-300 dark:bg-stone-600 animate-pulse" />
    <div className="w-1/2 h-10 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
  </div>
)
