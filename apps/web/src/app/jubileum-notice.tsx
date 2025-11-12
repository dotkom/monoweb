"use client"

import { OnlineLogo } from "@/components/atoms/OnlineLogo"
import { Tilt } from "@dotkomonline/ui"
import { IconArrowUpRight } from "@tabler/icons-react"
import { useEffect, useState } from "react"

interface Countdown {
  days: string
  hours: string
  minutes: string
  seconds: string
}

const formatCountdown = (now: number | Date, target: number | Date): Countdown | string => {
  const nowTime = typeof now === "number" ? now : now.getTime()
  const targetTime = typeof target === "number" ? target : target.getTime()
  const diff = targetTime - nowTime

  if (diff <= 0) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days: days.toString().padStart(2, "0"),
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  }
}

export const JubileumNotice = () => {
  const [now, setNow] = useState(new Date())
  const jubileumDate = new Date("2026-02-16T11:00:00Z")

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const countdown = formatCountdown(now, jubileumDate)

  return (
    <a href="https://jub.online.ntnu.no/" className="block relative group cursor-pointer">
      <Tilt>
        <div className="absolute top-4 right-4 z-10 text-white">
          <IconArrowUpRight className="size-6" />
        </div>

        <div className="relative bg-gradient-to-r from-blue-400 to-purple-400 p-4 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative flex flex-col lg:flex-row lg:justify-around items-center justify-center gap-2 text-center">
            <div className="relative text-white font-bold text-3xl md:text-4xl lg:text-5xl">
              <span className="opacity-0 tracking-wide">Online</span> Jubileum
              <OnlineLogo style="black" className="absolute top-1 -left-2 w-26 md:w-30 lg:w-38" />
            </div>

            {typeof countdown !== "string" && (
              <div className="w-full xs:w-fit flex items-center justify-center gap-1 sm:gap-2 bg-slate-800/30 backdrop-blur-sm xs:px-5 py-3 rounded-lg">
                <div className="flex flex-col items-center min-w-[4rem]">
                  <span
                    className="text-4xl font-bold bg-gradient-to-r from-orange-200 to-orange-300 bg-clip-text text-transparent"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {countdown.days}
                  </span>
                  <span className="text-xs text-slate-100 uppercase tracking-wider">Dager</span>
                </div>
                <span className="text-slate-100 text-2xl">:</span>
                <div className="flex flex-col items-center min-w-[4rem]">
                  <span
                    className="text-4xl font-bold bg-gradient-to-r from-orange-200 to-orange-300 bg-clip-text text-transparent"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {countdown.hours}
                  </span>
                  <span className="text-xs text-slate-100 uppercase tracking-wider">Timer</span>
                </div>
                <span className="text-slate-100 text-2xl">:</span>
                <div className="flex flex-col items-center min-w-[4rem]">
                  <span
                    className="text-4xl font-bold bg-gradient-to-r from-orange-200 to-orange-300 bg-clip-text text-transparent"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {countdown.minutes}
                  </span>
                  <span className="text-xs text-slate-100 uppercase tracking-wider">Min</span>
                </div>
                <span className="text-slate-100 text-2xl">:</span>
                <div className="flex flex-col items-center min-w-[4rem]">
                  <span
                    className="text-4xl font-bold bg-gradient-to-r from-orange-200 to-orange-300 bg-clip-text text-transparent"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {countdown.seconds}
                  </span>
                  <span className="text-xs text-slate-100 uppercase tracking-wider">Sek</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Tilt>
    </a>
  )
}
