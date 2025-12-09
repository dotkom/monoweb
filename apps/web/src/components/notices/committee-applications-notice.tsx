import { Button, Text, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowUpRight } from "@tabler/icons-react"
import { type Interval, isWithinInterval } from "date-fns"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"

export const CommitteeApplicationsNotice = (interval: Interval) => {
  if (!isWithinInterval(getCurrentUTC(), interval)) {
    return null
  }

  return (
    <Button
      element="a"
      href="https://opptak.online.ntnu.no"
      className="group flex flex-row justify-between w-full items-center p-5 min-h-24 bg-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/50 dark:hover:bg-indigo-400/50 rounded-2xl"
    >
      <div className="flex flex-row gap-5 items-center">
        <div className="transform translate-y-[12.5%]">
          <OnlineIcon size={32} className="animate-bounce" />
        </div>

        <div className="flex flex-col gap-0.5">
          <Title className="text-lg md:text-xl font-bold">Søk komité nå!</Title>
          <Text>
            Komiteene har opptak, og de ser etter akkurat deg! <span className="font-semibold">Trykk her</span> for å gå
            til opptakssiden (opptak.online.ntnu.no).
          </Text>
        </div>
      </div>

      <IconArrowUpRight className="size-6" />
    </Button>
  )
}
