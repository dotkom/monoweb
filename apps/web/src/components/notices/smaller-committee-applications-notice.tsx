import { TZDate } from "@date-fns/tz"
import { Badge, Button, Text, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowUpRight, IconClock } from "@tabler/icons-react"
import { type Interval, isWithinInterval } from "date-fns"
import { formatCompactTimeUntil } from "src/utils/countdown/formatCompactTimeUntil"

export const VelkomEkskomLeaderApplicationsNotice = (interval: Interval) => {
  if (!isWithinInterval(getCurrentUTC(), interval)) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 px-3">
        <div className="flex flex-row gap-1.5 items-center">
          <Title className="text-sm md:text-base font-bold">Bidra for dine medstudenter!</Title>

          <Badge className="px-1 h-5 text-muted-foreground">
            <IconClock className="size-3.5 shrink-0" />
            {formatCompactTimeUntil(TZDate.tz("Europe/Oslo", 2026, 10, 6, 23, 59, 59))}
          </Badge>
        </div>

        <div className="flex flex-row gap-1.5 items-center">
          <Text className="text-xs">
            Velkom og Ekskom har opptak til leder og nestleder, og de ser etter akkurat deg!
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
        <Button
          element="a"
          href="https://forms.gle/ZH6iUt82FWGE9PM69"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-row gap-2 justify-between w-full items-center p-4 bg-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/50 dark:hover:bg-indigo-400/50 halloween:bg-brand/15 halloween:hover:bg-brand/25 halloween:dark:bg-brand/20 halloween:dark:hover:bg-brand/30 halloween:text-foreground halloween:ring-1 halloween:ring-brand/30 rounded-xl sm:min-h-16 h-fit"
        >
          <div className="transform translate-y-[12.5%] shrink-0">
            <div className="animate-bounce text-xl">🤗</div>
          </div>

          <div className="flex flex-col gap-0.5 text-pretty">
            <Title className="max-sm:hidden text-lg font-semibold">Søk Velkom leder/nestleder</Title>
            <Title className="sm:hidden text-base font-semibold">Søk Velkom-ledelse</Title>

            <Text className="max-sm:hidden text-xs text-indigo-700 saturate-50 dark:saturate-100 dark:text-indigo-300 halloween:text-foreground/75 halloween:dark:text-foreground/75 halloween:saturate-100">
              Arrangere fadderukene for våre nye studenter i både 1. og 4. klasse.
            </Text>
          </div>

          <IconArrowUpRight className="ml-auto size-5 shrink-0" />
        </Button>

        <Button
          element="a"
          href="https://forms.gle/ZjN4Kxfe8QQ7Ptmr7"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-row gap-2 justify-between w-full items-center p-4 bg-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/50 dark:hover:bg-indigo-400/50 halloween:bg-brand/15 halloween:hover:bg-brand/25 halloween:dark:bg-brand/20 halloween:dark:hover:bg-brand/30 halloween:text-foreground halloween:ring-1 halloween:ring-brand/30 rounded-xl min-h-16 h-fit"
        >
          <div className="transform translate-y-[12.5%] shrink-0">
            <div className="animate-bounce text-xl">🌍</div>
          </div>
          <div className="flex flex-col gap-0.5 text-pretty">
            <Title className="max-sm:hidden text-lg font-semibold">Søk Ekskom leder/nestleder</Title>
            <Title className="sm:hidden text-base font-semibold">Søk Ekskom-ledelse</Title>

            <Text className="max-sm:hidden text-xs text-indigo-700 saturate-50 dark:saturate-100 dark:text-indigo-300 halloween:text-foreground/75 halloween:dark:text-foreground/75 halloween:saturate-100">
              Arrangere en spennende mulighet til å utforske nye steder med klassen din.
            </Text>
          </div>

          <IconArrowUpRight className="ml-auto size-5 shrink-0" />
        </Button>
      </div>
    </div>
  )
}
