"use client"

import { formatRollingCountdown } from "@/utils/countdown/formatRollingCountdown"
import { useCountdown } from "@/utils/countdown/use-countdown"
import { TZDate } from "@date-fns/tz"
import { Stripes, Text } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { type Interval, isBefore, isWithinInterval } from "date-fns"
import { BirthdayPartyGuessForm } from "./birthday-party-guess-form"

const eventStart = TZDate.tz("Europe/Oslo", 2026, 8, 15, 12, 0, 0)

export const BirthdayPartyNotice = (interval: Interval) => {
  const countdown = useCountdown(eventStart, formatRollingCountdown)

  if (!isWithinInterval(getCurrentUTC(), interval)) {
    return null
  }

  if (isBefore(getCurrentUTC(), eventStart)) {
    return (
      <Stripes
        colorA="bg-linear-to-b from-[#dbaed7] to-[#8cbfe2]"
        colorB="bg-white/8"
        stripeWidth={16}
        animated
        className="flex flex-col gap-2 rounded-lg p-6"
      >
        <div className="flex flex-col w-full h-full justify-center items-center">
          <Text className="text-sm font-medium">På Kontoret skjer det noe spennede om</Text>
          <Text suppressHydrationWarning className="text-3xl font-medium">
            {countdown}
          </Text>
        </div>
      </Stripes>
    )
  }

  return (
    <Stripes
      colorA="bg-linear-to-b from-[#dbaed7] to-[#8cbfe2]"
      colorB="bg-white/8"
      stripeWidth={16}
      animated
      className="rounded-lg p-2"
    >
      <BirthdayPartyGuessForm />
    </Stripes>
  )
}
