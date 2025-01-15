import type { Event } from "@dotkomonline/types"
import Image from "next/image"
import type { FC } from "react"

interface Props {
  event: Event
}

export const EventHeader: FC<Props> = ({ event }) => {
  const imageUrl = event.imageUrl || "https://via.placeholder.com/1920x1080"

  return (
    <section className="flex flex-col gap-8">
      <Image
        src={imageUrl}
        alt="Banner"
        width="0"
        height="0"
        sizes="100%"
        style={{ objectFit: "cover" }}
        className="h-[30rem] w-full rounded-2xl bg-slate-5"
      />
      <h1>{event.title}</h1>
    </section>
  )
}

export const SkeletonEventHeader = () => (
  <section className="flex flex-col gap-8">
    <div className="h-[30rem] w-full rounded-2xl bg-slate-5 animate-pulse" />
    <h1 className="w-1/2 bg-slate-5 text-transparent rounded-2xl animate-pulse">Lorem ipsum</h1>
    <div className="h-[50vh]" />
  </section>
)
