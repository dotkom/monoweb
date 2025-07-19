import {
  Checkbox,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { Icon } from "@iconify/react"
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
        <div className="inline-flex gap-1">
          <Checkbox label={label} onCheckedChange={field.onChange} checked={field.value as boolean} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger type="button">
                <Icon icon="tabler:info-circle" />
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 max-w-[400px] select-none rounded-[4px] bg-[#ffffff] p-3 leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
                  sideOffset={5}
                >
                  {tooltip}
                  <TooltipArrow className="fill-white" />
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    />
  )
}
