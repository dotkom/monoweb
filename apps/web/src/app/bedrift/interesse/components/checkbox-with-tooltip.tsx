"use client"

import { Checkbox, Tooltip, TooltipContent, TooltipPortal, TooltipTrigger } from "@dotkomonline/ui"
import { IconQuestionMark } from "@tabler/icons-react"
import type { FC, ReactNode } from "react"
import { Controller, useFormContext } from "react-hook-form"
import type { FormSchema } from "./form-schema"

export interface CheckboxWithTooltipProps {
  name: keyof FormSchema
  label: string
  tooltip: ReactNode
}

export const CheckboxWithTooltip: FC<CheckboxWithTooltipProps> = ({ label, name, tooltip }) => {
  const form = useFormContext<FormSchema>()

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <div className="inline-flex gap-3">
          <Checkbox label={label} onCheckedChange={field.onChange} checked={field.value as boolean} />

          <Tooltip delayDuration={0}>
            <TooltipTrigger className="p-0.5 border border-gray-200 bg-gray-50 dark:border-stone-700 dark:bg-stone-800 h-fit w-fit aspect-square rounded-full">
              <IconQuestionMark className="size-4" />
            </TooltipTrigger>

            <TooltipPortal>
              <TooltipContent className="text-sm/6">{tooltip}</TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </div>
      )}
    />
  )
}
