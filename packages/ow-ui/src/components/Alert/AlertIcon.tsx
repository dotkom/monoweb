import { IconInfoCircle, IconCircleCheck, IconAlertTriangle, IconAlertCircle } from "@tabler/icons"
import { cva } from "cva"
import { FC } from "react"
import { twMerge } from "tailwind-merge"

interface AlertIconProps {
  status: "info" | "warning" | "success" | "danger"
  className?: string
  monochrome?: boolean
}

export const AlertIcon: FC<AlertIconProps> = ({ status, className, monochrome }) => {
  const iconProps = { size: 24, stroke: 2, className: twMerge(icon({ status }), className) }

  switch (status) {
    case "info":
      return <IconInfoCircle {...iconProps} />
    case "success":
      return <IconCircleCheck {...iconProps} />
    case "danger":
      return <IconAlertCircle {...iconProps} />
    case "warning":
      return <IconAlertTriangle {...iconProps} />
  }
}

const icon = cva("mr-2", {
  variants: {
    status: {
      info: "text-blue-11",
      success: "text-green-11",
      danger: "text-red-11",
      warning: "text-amber-11",
    },
    monochrome: {
      info: "text-slate-11",
      success: "text-slate-11",
      danger: "text-slate-11",
      warning: "text-slate-11",
    },
  },
})
