import type { Event } from "@dotkomonline/types"
import { Button, Icon, Text, Tilt, Title } from "@dotkomonline/ui"
import Image from "next/image"
import type { FC } from "react"

interface Props {
  event: Event
  isStaff: boolean
}

export const EventHeader: FC<Props> = ({ event, isStaff }) => {
  const imageUrlLight = event.imageUrl || "/placeholder.svg"
  const imageUrlDark = event.imageUrl || "/placeholder.svg"

  return (
    <section className="flex flex-col gap-8">
      <Tilt scale={1} tiltMaxAngleX={0.25} tiltMaxAngleY={0.25} glareMaxOpacity={0.1}>
        <Image
          src={imageUrlLight}
          alt="Banner"
          width="0"
          height="0"
          sizes="100%"
          style={{ objectFit: "cover" }}
          className="w-full rounded-xl bg-gray-400 aspect-[16/9] md:aspect-[24/9] dark:hidden"
        />
        <Image
          src={imageUrlDark}
          alt="Banner"
          width="0"
          height="0"
          sizes="100%"
          style={{ objectFit: "cover" }}
          className="w-full rounded-xl bg-gray-400 aspect-[16/9] md:aspect-[24/9] hidden dark:block"
        />
      </Tilt>

      <div className="flex flex-col gap-2 md:flex-row md:gap-4 md:items-center">
        <Title element="h1" size="xl" title={event.title} className="text-3xl sm:text-4xl sm:line-clamp-3">
          {event.title}
        </Title>
        {isStaff && (
          <Button variant="text" className="w-fit p-1.5 bg-gray-100 dark:bg-stone-900 gap-1.5">
            <Icon icon="tabler:edit" className="text-lg md:text-2xl" />
            <Text className="md:hidden">Gå til dashboard</Text>
          </Button>
        )}
      </div>
    </section>
  )
}

export const SkeletonEventHeader = () => (
  <div className="flex flex-col gap-8">
    <div className="w-full rounded-xl aspect-[16/9] md:aspect-[24/9] bg-gray-300 dark:bg-stone-700 animate-pulse" />
    <div className="w-1/2 h-10 rounded-full bg-gray-300 dark:bg-stone-700 animate-pulse" />
  </div>
)
