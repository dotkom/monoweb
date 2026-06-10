"use client"

import { PlaceHolderImage } from "@/components/atoms/PlaceHolderImage"
import { env } from "@/env"
import type { Event } from "@dotkomonline/types"
import { Button, Text, Tilt, Title, cn } from "@dotkomonline/ui"
import { IconArrowsDiagonal, IconArrowsDiagonalMinimize2, IconEdit } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"
import { useState } from "react"

interface Props {
  event: Event
  showDashboardLink: boolean
}

export const EventHeader: FC<Props> = ({ event, showDashboardLink }) => {
  const [showFullImage, setShowFullImage] = useState(true)
  const [hasCorrectAspectRatio, setHasCorrectAspectRatio] = useState<boolean | null>(null)
  const dashboardUrl = new URL(`/arrangementer/${event.id}`, env.NEXT_PUBLIC_DASHBOARD_URL).toString()

  return (
    <section className="flex flex-col gap-8">
      <Tilt
        scale={1}
        tiltMaxAngleX={0.25}
        tiltMaxAngleY={0.25}
        glareMaxOpacity={0.1}
        className="rounded-xl bg-gray-100 dark:bg-stone-800/50"
      >
        <div className="group relative w-full aspect-video md:aspect-24/9 overflow-hidden rounded-xl">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              sizes="100vw"
              className={cn(
                "rounded-xl will-change-transform transition-transform duration-500 ease-out",
                showFullImage ? "object-contain" : "object-cover"
              )}
              onLoad={(loadEvent) => {
                const image = loadEvent.currentTarget
                const ratio = image.naturalWidth / image.naturalHeight
                const target = 5 / 2
                const epsilon = 0.05
                setHasCorrectAspectRatio(Math.abs(ratio - target) < epsilon)
              }}
            />
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

          {event.imageUrl && hasCorrectAspectRatio !== null && !hasCorrectAspectRatio && (
            <div className="absolute right-3 top-3 z-10 hidden opacity-0 transition-opacity duration-200 md:block md:group-hover:opacity-100">
              <Button
                variant="default"
                className="p-2 rounded-md bg-black/40 text-white hover:bg-black/50 dark:bg-black/40 dark:hover:bg-black/50"
                onClick={() => setShowFullImage((prev) => !prev)}
                aria-label={showFullImage ? "Fyll rammen" : "Se hele bildet"}
              >
                {showFullImage ? (
                  <IconArrowsDiagonal className="size-5" />
                ) : (
                  <IconArrowsDiagonalMinimize2 className="size-5" />
                )}
              </Button>
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
            variant="secondary"
            title="Rediger arrangement"
            className="text-stone-500 dark:text-stone-500 max-md:w-fit md:size-8"
          >
            <IconEdit className="size-[1.25em] md:size-6" />
            <Text className="md:hidden">Rediger</Text>
          </Button>
        )}
      </div>
    </section>
  )
}

export const SkeletonEventHeader = () => (
  <div className="flex flex-col gap-8">
    <div className="w-full rounded-xl aspect-video md:aspect-24/9 bg-gray-300 dark:bg-stone-600 animate-pulse" />
    <div className="w-1/2 h-10 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
  </div>
)
