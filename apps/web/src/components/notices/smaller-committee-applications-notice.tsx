import { Button, Text, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowUpRight, IconClock } from "@tabler/icons-react"
import { type Interval, isWithinInterval } from "date-fns"

export const SmallerCommitteeApplicationsNotice = (interval: Interval) => {
  if (!isWithinInterval(getCurrentUTC(), interval)) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <Title className="text-sm md:text-base font-bold">Bidra for dine medstudenter!</Title>
        <div className="flex flex-row gap-1.5 items-center">
          <Text className="text-xs">
            Velkom og Ekskom har opptak til leder og nestleder, og de ser etter akkurat deg!
          </Text>
          <div className="flex flex-row gap-1 items-center">
            <IconClock className="size-3.5 shrink-0" />
            <Text className="text-xs font-semibold">Frist 1. des. kl. 23:59</Text>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6 min-h-16">
          <Button
            element="a"
            href="https://forms.gle/caHRfAMhcKJrm3h18"
            className="group flex flex-row justify-between w-full items-center p-5 bg-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/50 dark:hover:bg-indigo-400/50 rounded-lg"
          >
            <div className="flex flex-row gap-2 items-center">
              <div className="transform translate-y-[12.5%] shrink-0">
                <div className="animate-bounce text-2xl">🤗</div>
              </div>

              <div className="flex flex-col gap-0.5">
                <Title className="text-base md:text-lg font-semibold">Søk Velkom leder/nestleder</Title>
                <Text className="text-xs">
                  Velkomstkomiteen er ansvarlig for å arrangere fadderukene for våre nye studenter i både 1. og 4.
                  klasse
                </Text>
              </div>
            </div>

            <IconArrowUpRight className="size-6 shrink-0" />
          </Button>
          <Button
            element="a"
            href="https://forms.gle/CZwcHGxnmtaMAMqL8"
            className="group flex flex-row justify-between w-full items-center p-5 bg-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/50 dark:hover:bg-indigo-400/50 rounded-lg"
          >
            <div className="flex flex-row gap-2 items-center">
              <div className="transform translate-y-[12.5%] shrink-0">
                <div className="animate-bounce text-2xl">🌍</div>
              </div>
              <div className="flex flex-col gap-0.5">
                <Title className="text-base md:text-lg font-semibold">Søk Ekskom leder/nestleder</Title>
                <Text className="text-xs">
                  Ekskom er ansvarlig for å arrangere ekskursjon for 3. klasse—en spennende mulighet til å utforske nye
                  steder med klassen din.
                </Text>
              </div>
            </div>

            <IconArrowUpRight className="size-6 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  )
}
