"use client"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { formatNumericalTimeLeft, useCountdown } from "@/utils/use-countdown"
import { TZDate } from "@date-fns/tz"
import { Text } from "@dotkomonline/ui"
import { IconArrowUpRight } from "@tabler/icons-react"
import Link from "next/link"

export const JubileumNotice = () => {
  const jubileumDate = TZDate.tz("Europe/Oslo", 2026, 1, 16, 12, 0, 0)

  const countdown = useCountdown(jubileumDate, formatNumericalTimeLeft)

  if (!countdown) {
    return null
  }

  return (
    <Link
      href="/arrangementer/Online-Jubileum/d039731c-721a-4746-8950-fc125dc179ff/"
      className="flex flex-row items-center gap-4 p-1.5 justify-between cursor-pointer bg-zinc-700 dark:bg-stone-100 rounded-lg"
    >
      <div className="flex items-center gap-2 ml-1">
        <OnlineIcon variant="dark" size={16} className="dark:hidden" />
        <OnlineIcon variant="light" size={16} className="not-dark:hidden" />
        <Text className="text-sm text-white dark:text-black">Online Jubileum</Text>
      </div>

      <Text className="text-sm text-white dark:text-black tabular-nums">{countdown}</Text>
      <IconArrowUpRight className="text-white dark:text-black size-4" />
    </Link>
  )
}
