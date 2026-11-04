"use client"

import type { ContestantDetail } from "@dotkomonline/rpc/contest"
import { Input } from "@dotkomonline/ui/components/input"
import { useEffect, useState } from "react"
import { useUpdateContestantResultMutation } from "../../../mutations"

type ContestantResultInputProps = {
  contestant: ContestantDetail
  suffix?: string
  disabled?: boolean
  onSaved: (contestantId: string) => void
}

export function ContestantResultInput({ contestant, suffix, disabled, onSaved }: ContestantResultInputProps) {
  const updateResult = useUpdateContestantResultMutation()
  const [value, setValue] = useState(
    contestant.resultValue !== null && contestant.resultValue !== undefined ? String(contestant.resultValue) : ""
  )

  useEffect(() => {
    setValue(
      contestant.resultValue !== null && contestant.resultValue !== undefined ? String(contestant.resultValue) : ""
    )
  }, [contestant.resultValue])

  const handleBlur = () => {
    const trimmed = value.trim()
    const numValue = trimmed === "" ? null : Number.parseInt(trimmed, 10)

    if (trimmed !== "" && Number.isNaN(numValue)) {
      return
    }

    if (numValue !== contestant.resultValue) {
      updateResult.mutate(
        { contestantId: contestant.id, data: { resultValue: numValue } },
        { onSuccess: () => onSaved(contestant.id) }
      )
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        inputMode="numeric"
        className="h-8 w-28 tabular-nums"
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
        }}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="—"
      />
      {suffix && <span className="text-sm text-muted-foreground whitespace-nowrap">{suffix}</span>}
    </div>
  )
}
