import { Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import type { PropsWithChildren } from "react"

type PermissionTooltipProps = PropsWithChildren<{
  allowed: boolean
  label?: string
  className?: string
}>

export function PermissionTooltip({
  allowed,
  label = "Du har ikke redigeringstilgang til dette",
  children,
  className,
}: PermissionTooltipProps) {
  if (allowed) {
    return children
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{children}</span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
