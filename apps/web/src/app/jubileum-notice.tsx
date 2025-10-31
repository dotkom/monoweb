"use client"
import { TZDate } from "@date-fns/tz"
import { Text } from "@dotkomonline/ui"
import { differenceInDays, intervalToDuration } from "date-fns"
import Link from "next/link"
import { useEffect, useState } from "react"

const formatCountdown = (now: Date, target: Date) => {
  const duration = intervalToDuration({ start: now, end: target })
  const days = Math.max(differenceInDays(target, now), 0)

  let string = `${days.toString().padStart(2, "0")}d`
  string += ` ${(duration.hours ?? 0).toString().padStart(2, "0")}t`
  string += ` ${(duration.minutes ?? 0).toString().padStart(2, "0")}m`
  string += ` ${(duration.seconds ?? 0).toString().padStart(2, "0")}s`

  return string
}

export const JubileumNotice = () => {
  const [now, setNow] = useState(new Date())
  const jubileumStartDateUtc = new TZDate("2026-02-16T17:30:00", "+02:00")

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const countdown = formatCountdown(now, jubileumStartDateUtc)

  return (
    <div className="bg-black rounded-2xl h-32">
      <div className="relative h-full bg-[linear-gradient(rgba(255,255,255,0.1)_50%,transparent_50%)] bg-[length:10%_10px] animate-scan rounded-2xl" />

      <Link
        href="https://jub.online.ntnu.no/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col justify-center items-center animate-flicker -mt-32 h-full"
      >
        <Text className="font-glass text-white text-2xl lg:text-4xl">Online Jubileum</Text>
        <Text className="font-glass text-white text-2xl lg:text-4xl" suppressHydrationWarning={true}>
          {countdown}
        </Text>
      </Link>
    </div>
  )
}
