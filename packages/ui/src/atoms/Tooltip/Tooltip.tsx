"use client"

import {
  Tooltip as ShadcnTooltip,
  TooltipContent as ShadcnTooltipContent,
  TooltipProvider,
  TooltipTrigger as ShadcnTooltipTrigger,
} from "#components/tooltip"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import type { ComponentProps, ReactNode } from "react"
import { tooltipArrowClass } from "#lib/tooltip-classes"
import { resolveAsChildRender } from "../../lib/as-child"
import { cn } from "../../utils"

export { TooltipProvider }

type TooltipProps = ComponentProps<typeof ShadcnTooltip> & {
  delayDuration?: number
}

export function Tooltip({ delayDuration, ...props }: TooltipProps) {
  return (
    <TooltipProvider delay={delayDuration}>
      <ShadcnTooltip {...props} />
    </TooltipProvider>
  )
}

type TriggerProps = ComponentProps<typeof ShadcnTooltipTrigger> & {
  asChild?: boolean
}

export function TooltipTrigger({ asChild, children, ...props }: TriggerProps) {
  const resolved = resolveAsChildRender({ asChild, children })

  return (
    <ShadcnTooltipTrigger render={resolved.render} {...props}>
      {resolved.children}
    </ShadcnTooltipTrigger>
  )
}

export function TooltipPortal({ children }: { children?: ReactNode }) {
  return children
}

export function TooltipContent({ className, ...props }: ComponentProps<typeof ShadcnTooltipContent>) {
  return <ShadcnTooltipContent className={cn(className)} {...props} />
}

export function TooltipArrow({ className }: { className?: string }) {
  return <TooltipPrimitive.Arrow className={cn(tooltipArrowClass, className)} />
}
