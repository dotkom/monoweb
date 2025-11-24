import { IconAlertCircle, IconAlertTriangle, IconCircleCheck, IconError404, IconInfoCircle } from "@tabler/icons-react"
import { type VariantProps, cva } from "cva"
import type { FC } from "react"
import { cn } from "../../utils"

const iconVariant = cva("", {
  variants: {
    status: {
      info: "text-blue-950",
      success: "text-green-950",
      danger: "text-red-950",
      warning: "text-amber-950",
    },
  },
})

interface AlertIconProps extends Required<VariantProps<typeof iconVariant>> {
  className?: string
  size?: number
}

export const AlertIcon: FC<AlertIconProps> = ({ status, className, size = 24 }) => {
  const IconComponent = getIconComponent(status)

  return <IconComponent size={size} className={cn(iconVariant({ status }), className)} />
}

const getIconComponent = (status: AlertIconProps["status"]) => {
  switch (status) {
    case "info":
      return IconInfoCircle
    case "success":
      return IconCircleCheck
    case "danger":
      return IconAlertCircle
    case "warning":
      return IconAlertTriangle
    default:
      return IconError404
  }
}
