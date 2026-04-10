import { Button, Text, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowUpRight, IconClock } from "@tabler/icons-react"
import { type Interval, isWithinInterval } from "date-fns"

export const FadderApplicationsNotice = (interval: Interval) => {
  if (!isWithinInterval(getCurrentUTC(), interval)) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <Title className="text-sm md:text-base font-semibold">Husker du hvor morsomme fadderukene var?</Title>
        <div className="flex flex-row gap-1.5 items-center w-full justify-between">
          <Text className="text-xs">Velkom leter etter faddere, og du kan være en av dem!</Text>
          <div className="flex flex-row gap-1.5 items-center">
            <IconClock className="size-3.5 shrink-0" />
            <Text className="text-xs">Frist 17. april kl. 23:59</Text>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-5 w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6 min-h-16 w-full">
          <Button
            element="a"
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.google.com/forms/d/e/1FAIpQLSdrJxxsaJFx5Vxn-jnFuHPzru0VR9NxTDwSKkM1zyaAh3sUUg/viewform?usp=sharing&ouid=103573623441947136785"
            className="group flex flex-row justify-between w-full items-center p-5 bg-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/50 dark:hover:bg-indigo-400/50 rounded-lg"
          >
            <div className="flex flex-row gap-2 items-center">
              <div className="transform translate-y-[12.5%] shrink-0">
                <div className="animate-bounce text-3xl">🤗</div>
              </div>

              <div className="flex flex-col gap-0.5">
                <Title className="text-lg md:text-xl font-semibold">Bli fadder!</Title>
                <Text className="text-xs">Bidra til å gi nye informatikere en fantastisk studiestart til høsten.</Text>
              </div>
            </div>

            <IconArrowUpRight className="size-6 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  )
}
