"use client"

import { type ContestantDetail, getContestantName } from "@dotkomonline/rpc/contest"
import { Button, Stripes, Text, Title, cn } from "@dotkomonline/ui"
import { IconArrowUpRight, IconEye, IconEyeOff, IconHandClick, IconMoodPuzzled } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const STORAGE_KEY = "fadderuke-2026-banner-hidden"

function getPodiumImage(rank: number) {
  if (rank >= 1 && rank <= 3) {
    return `/fadderuke-2026-podium-${rank}.svg`
  }

  return "/fadderuke-2026-podium-none.svg"
}

function getRankLabel(rank: number) {
  if (rank === 1) {
    return "Førsteplass"
  }

  if (rank === 2) {
    return "Andreplass"
  }

  if (rank === 3) {
    return "Tredjeplass"
  }

  return `${rank}. plass`
}

export type NoticeContestantSlot = {
  contestant: ContestantDetail
  rank: number
  isYourTeam: boolean
  hideOnNarrow: boolean
}

function ContestantSlotDisplay({ slot }: { slot: NoticeContestantSlot }) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-rows-[auto_auto] gap-1 -mx-2",
        "md:grid-rows-subgrid md:row-span-2",
        slot.hideOnNarrow && "max-lg:hidden"
      )}
    >
      <div className={cn("px-2", !slot.isYourTeam && "max-md:hidden")}>
        {slot.isYourTeam ? (
          <Text className="text-base sm:text-sm font-semibold text-muted-foreground font-title">Ditt lag</Text>
        ) : null}
      </div>

      <div
        className={cn(
          "flex flex-row items-center gap-3 sm:gap-5 rounded-xl p-2",
          slot.isYourTeam &&
            "transition-colors bg-[#b7dced] group-hover/fadderuke-link:bg-violet-200/50 dark:bg-white/5"
        )}
      >
        <Image
          src={getPodiumImage(slot.rank)}
          alt=""
          width={120}
          height={120}
          draggable={false}
          className="size-16 shrink-0 select-none sm:size-24"
        />

        <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
          <Text className="text-xs font-medium text-muted-foreground sm:text-sm">{getRankLabel(slot.rank)}</Text>
          <Text className="truncate text-base font-marcellus font-semibold sm:text-xl">
            {getContestantName(slot.contestant)}
          </Text>
          <Text className="text-sm sm:text-base text-muted-foreground">{slot.contestant.resultValue ?? 0} poeng</Text>
        </div>
      </div>
    </div>
  )
}

type Fadderuke2026NoticeBannerProps = {
  contestantSlots: NoticeContestantSlot[]
}

export function Fadderuke2026NoticeBanner({ contestantSlots }: Fadderuke2026NoticeBannerProps) {
  const [isHidden, setIsHidden] = useState(false)
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false)

  useEffect(() => {
    setIsHidden(localStorage.getItem(STORAGE_KEY) === "1")
    setHasLoadedPreference(true)
  }, [])

  const hideBanner = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setIsHidden(true)
  }

  const showBanner = () => {
    localStorage.removeItem(STORAGE_KEY)
    setIsHidden(false)
  }

  if (!hasLoadedPreference) {
    return null
  }

  if (isHidden) {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <Text className="text-sm text-muted-foreground">
          Fadderukene-banneret er skjult. Du finner siden under{" "}
          <span className="font-medium text-foreground">For studenter {">"} Fadderukene</span>.
        </Text>

        <div className="flex flex-row items-center gap-2 shrink-0">
          <Button
            element={Link}
            href="/fadderukene"
            variant="ghost"
            className="w-fit font-normal text-muted-foreground max-sm:hidden"
          >
            <Text element="span" className="text-sm">
              Gå til fadderukene
            </Text>
            <IconArrowUpRight className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={showBanner}
            className="w-fit font-normal text-muted-foreground"
          >
            <IconEye className="size-4" />
            <Text element="span" className="text-sm">
              Vis banner
            </Text>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 mb-12">
      <div className="flex flex-row gap-3 items-center ml-6 mr-3 justify-between">
        <div className="flex flex-row gap-2 items-center text-muted-foreground">
          <IconHandClick className="size-4 shrink-0" />

          <Text element="span" className="text-sm max-sm:hidden">
            Trykk for å gå til fadderukesiden
          </Text>
          <Text element="span" className="text-sm sm:hidden">
            Banneret er en lenke
          </Text>
        </div>

        <Button
          type="button"
          variant="ghost"
          color="red"
          onClick={hideBanner}
          className="flex flex-row gap-2 items-center text-muted-foreground dark:text-muted-foreground font-normal"
        >
          <IconEyeOff className="size-4 shrink-0" />

          <Text element="span" className="text-sm">
            Skjul banner
          </Text>
        </Button>
      </div>

      <Link
        href="/fadderukene"
        className="group/fadderuke-link flex flex-col gap-6 rounded-2xl transition-colors bg-[#c5e5f1] dark:bg-sky-950 hover:bg-violet-100 dark:hover:bg-teal-950"
      >
        <div className="p-3">
          <Stripes
            colorA="bg-[#c5e5f1] group-hover/fadderuke-link:bg-violet-100 dark:bg-sky-950 dark:group-hover/fadderuke-link:bg-teal-950 transition-colors"
            colorB="bg-[#b7dced] group-hover/fadderuke-link:bg-violet-200 dark:bg-blue-900 dark:group-hover/fadderuke-link:bg-cyan-900 transition-colors"
            animated
            className="rounded-xl p-4"
          >
            <div className="flex flex-col gap-2">
              <Title element="p" className="text-4xl sm:text-5xl font-marcellus font-semibold uppercase">
                Onlinelekene
              </Title>

              <Text
                element="h2"
                className="text-xl font-medium dark:text-blue-300 dark:group-hover/fadderuke-link:text-teal-300 transition-colors"
              >
                Fadderukene 2026
              </Text>
            </div>
          </Stripes>
        </div>

        <div className="flex flex-row mx-4 sm:mx-7 gap-4 sm:gap-5 items-center">
          <IconMoodPuzzled className="size-7 shrink-0" />

          <div className="flex flex-col gap-1 min-w-0">
            <Text className="text-base sm:text-lg font-medium">Ny på informatikk?</Text>
            <Text className="text-sm sm:text-base text-muted-foreground">
              Trykk her for å se fadderukesiden og få informasjon om hvordan du kommer i gang.
            </Text>
          </div>
        </div>

        {contestantSlots.length > 0 && (
          <div
            className={cn(
              "mx-4 sm:mx-7 mt-2 sm:mt-4 grid grid-cols-1 gap-4 md:grid-rows-[auto_auto] md:gap-x-8 md:gap-y-1",
              contestantSlots.length >= 2 && "md:grid-cols-2",
              contestantSlots.length >= 3 && "lg:grid-cols-3"
            )}
          >
            {contestantSlots.map((slot) => (
              <ContestantSlotDisplay key={slot.contestant.id} slot={slot} />
            ))}
          </div>
        )}

        <Image
          src="/fadderuke-2026-hero-empty.svg"
          alt=""
          width={1080}
          height={729}
          priority
          draggable={false}
          className="mt-4 h-auto w-full select-none rounded-xl md:hidden dark:hidden"
        />
        <Image
          src="/fadderuke-2026-hero-empty-dark.svg"
          alt=""
          width={1080}
          height={729}
          priority
          draggable={false}
          className="mt-4 h-auto w-full select-none rounded-xl not-dark:hidden md:hidden"
        />
        <Image
          src="/fadderuke-2026-hero-empty-small.svg"
          alt=""
          width={1080}
          height={729}
          priority
          draggable={false}
          className="mt-4 hidden h-auto w-full select-none rounded-xl md:block dark:hidden"
        />
        <Image
          src="/fadderuke-2026-hero-empty-small-dark.svg"
          alt=""
          width={1080}
          height={729}
          priority
          draggable={false}
          className="mt-4 hidden h-auto w-full select-none rounded-xl not-dark:hidden md:block"
        />
      </Link>
    </div>
  )
}
