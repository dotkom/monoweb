import type { Event } from "@dotkomonline/types"
import { Tilt, Title } from "@dotkomonline/ui"
import Image from "next/image"
import type { FC } from "react"

interface Props {
  event: Event
}

export const EventHeader: FC<Props> = ({ event }) => {
  const imageUrlLight = event.imageUrl || "https://placehold.co/1920x1080/png?text=Arrangementbanner"
  const imageUrlDark = event.imageUrl || "https://placehold.co/1920x1080/27272a/9f9fa9/png?text=Arrangementbanner"

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

      <Title element="h1" size="xl" className="text-4xl">
        {event.title}
      </Title>
    </section>
  )
}

export const SkeletonEventHeader = () => (
  <div className="flex flex-col gap-8">
    <div className="w-full rounded-xl aspect-[16/9] md:aspect-[24/9] bg-gray-300 dark:bg-stone-700 animate-pulse" />
    <div className="w-1/2 h-10 rounded-full bg-gray-300 dark:bg-stone-700 animate-pulse" />
  </div>
)
