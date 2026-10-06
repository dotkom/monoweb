"use client"

import { isSidequestDeregistrationOpen, isSidequestRegistrationOpen } from "@dotkomonline/rpc/sidequest"
import { Text, cn } from "@dotkomonline/ui"
import { formatDate, isThisYear } from "date-fns"
import { nb } from "date-fns/locale"

interface Props {
  registerEnd: Date | null
  deregisterDeadline: Date | null
}

export const SidequestRegistrationDateInfo = ({ registerEnd, deregisterDeadline }: Props) => {
  const canRegister = isSidequestRegistrationOpen({ registerEnd })
  const canDeregister = isSidequestDeregistrationOpen({ deregisterDeadline })

  if (registerEnd === null && deregisterDeadline === null) {
    return null
  }

  return (
    <div className="flex w-fit flex-wrap gap-x-8 gap-y-2">
      {deregisterDeadline !== null && (
        <DeadlineRow label="Avmeldingsfrist" date={deregisterDeadline} isPastDeadline={!canDeregister} />
      )}
      {registerEnd !== null && (
        <DeadlineRow label={canRegister ? "Lukker" : "Lukket"} date={registerEnd} isPastDeadline={!canRegister} />
      )}
    </div>
  )
}

function DeadlineRow({ label, date, isPastDeadline }: { label: string; date: Date; isPastDeadline: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Text size="sm" className={cn("text-muted-foreground", isPastDeadline && "text-gray-500 dark:text-stone-500")}>
        {label}
      </Text>
      <Text size="sm" className={cn(isPastDeadline && "text-muted-foreground")}>
        {formatDeadline(date)}
      </Text>
    </div>
  )
}

function formatDeadline(date: Date) {
  const datePattern = isThisYear(date) ? "d. MMM" : "dd.MM.yyyy"

  return `${formatDate(date, datePattern, { locale: nb })} kl. ${formatDate(date, "HH:mm", { locale: nb })}`
}
