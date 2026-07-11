import type { PropsWithChildren } from "react"
import { Tooltip } from "@mantine/core"

type PermissionTooltipProps = PropsWithChildren<{
  allowed: boolean
  label?: string
}>

export function PermissionTooltip({
  allowed,
  label = "Du har ikke redigeringstilgang til dette",
  children,
}: PermissionTooltipProps) {
  if (allowed) {
    return children
  }

  return (
    <Tooltip label={label}>
      <span>{children}</span>
    </Tooltip>
  )
}
