import { Text } from "@dotkomonline/ui"
import { IconAlertTriangle } from "@tabler/icons-react"

interface AvailableInterviewTimeProps {
  hours: number
}

export function AvailableInterviewTime({ hours }: AvailableInterviewTimeProps) {
  if (hours >= 6) {
    return null
  }

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <IconAlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <Text>
        Du har mindre enn 6 timer tilgjengelig. Åpne gjerne opp flere tider, så blir det lettere å finne en intervjutid.
      </Text>
    </div>
  )
}
