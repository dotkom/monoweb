"use client"

import { INTERVIEW_SLOT_COLORS } from "../../../../components/Calendar/slot-layout"
import { Text } from "@dotkomonline/ui"

export function InterviewCalendarHeader({ canAttend }: { canAttend: boolean }) {
  const legend = [
    ...(canAttend ? ([[INTERVIEW_SLOT_COLORS.own, "Dine intervjuer"]] as const) : []),
    [INTERVIEW_SLOT_COLORS.understaffed, "Intervjuer som mangler deltagere"],
  ] as const

  return (
    <div className="flex flex-wrap items-center gap-4">
      {legend.map(([color, text]) => (
        <Text key={text} element="span" className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className="size-3.5 rounded-[3px] border"
            style={{ backgroundColor: color.background, borderColor: color.border }}
          />
          {text}
        </Text>
      ))}
    </div>
  )
}
