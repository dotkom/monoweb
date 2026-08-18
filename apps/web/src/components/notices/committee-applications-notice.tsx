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

export const CommitteeApplicationsNotice = ({
  children,
  start,
  end,
  hideCountdown = false,
}: CommitteeApplicationsNoticeProps) => {
  if (!isWithinInterval(getCurrentUTC(), { start, end })) {
    return null
  }

  const content = children ?? (
    <>
      <Title className="text-lg md:text-xl font-bold">Søk komité nå!</Title>{" "}
      <Text className="text-pretty">
        Komiteene har opptak, og de ser etter akkurat deg! <span className="font-semibold">Trykk her</span> for å gå til
        opptakssiden (opptak.online.ntnu.no).
      </Text>
    </>
  )

  let countdown = null

  if (!hideCountdown) {
    countdown = (
      <div className="flex flex-row items-center justify-end gap-1.5 mr-3 text-muted-foreground">
        <IconClock className="size-4 shrink-0" />
        <Text element="span" className="text-sm">
          {capitalizeFirstLetter(formatDistanceToNow(end, { locale: nb }))}
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {countdown}

      <Button
        element="a"
        href="https://opptak.online.ntnu.no"
        className="group flex h-auto min-h-24 w-full flex-row justify-between whitespace-normal rounded-2xl bg-indigo-200 p-5 hover:bg-indigo-100 dark:bg-indigo-500/30 dark:hover:bg-indigo-400/30"
      >
        <div className="flex min-w-0 w-full flex-row gap-5 items-center">
          <div className="shrink-0 transform translate-y-[12.5%] max-sm:hidden">
            <div className="p-1 not-dark:bg-white rounded-full animate-bounce">
              <OnlineIcon size={32} />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">{content}</div>
        </div>

        <IconArrowUpRight className="size-6 shrink-0" />
      </Button>
    </div>
  )
}
