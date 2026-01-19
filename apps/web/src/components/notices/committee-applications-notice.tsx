import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { Button, Text, Title } from "@dotkomonline/ui"
import { capitalizeFirstLetter, getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowUpRight, IconClock } from "@tabler/icons-react"
import { formatDistanceToNow, type Interval, isWithinInterval } from "date-fns"
import type { PropsWithChildren } from "react"
import { nb } from "date-fns/locale"

type CommitteeApplicationsNoticeProps = PropsWithChildren<
  {
    hideCountdown?: boolean
  } & Interval
>

export const CommitteeApplicationsNotice = ({ children, start, end }: CommitteeApplicationsNoticeProps) => {
  if (!isWithinInterval(getCurrentUTC(), { start, end })) {
    return null
  }

  const content = children ?? (
    <>
      <Title className="text-lg md:text-xl font-bold">Søk komité nå!</Title>{" "}
      <Text>
        Komiteene har opptak, og de ser etter akkurat deg! <span className="font-semibold">Trykk her</span> for å gå til
        opptakssiden (opptak.online.ntnu.no).
      </Text>
    </>
  )

  return (
    <Button
      element="a"
      href="https://opptak.online.ntnu.no"
      className="relative group flex flex-row w-full justify-between p-5 min-h-24 bg-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/50 dark:hover:bg-indigo-400/50 rounded-2xl"
    >
      <div className="absolute top-3 right-6 flex flex-row items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
        <IconClock size="0.8rem" />
        <Text className="text-xs">{capitalizeFirstLetter(formatDistanceToNow(end, { locale: nb }))}</Text>
      </div>

      <div className="flex flex-row w-full gap-5 items-center">
        <div className="shrink-0 transform translate-y-[12.5%] max-sm:hidden">
          <div className="p-1 not-dark:bg-white rounded-full animate-bounce">
            <OnlineIcon size={32} />
          </div>
        </div>

        <div className="flex flex-col gap-2">{content}</div>
      </div>

      <IconArrowUpRight className="size-6 shrink-0" />
    </Button>
  )
}
