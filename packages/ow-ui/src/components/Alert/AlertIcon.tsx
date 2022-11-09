import { IconInfoCircle, IconCircleCheck, IconAlertTriangle, IconAlertCircle } from "@tabler/icons"
import { FC } from "react"

interface AlertIconProps {
  status: "info" | "warning" | "success" | "danger"
}

export const AlertIcon: FC<AlertIconProps> = ({ status }) => {
  const iconProps = { size: 24, stroke: 2 }

  switch (status) {
    case "info":
      return <IconInfoCircle {...iconProps} className="text-blue-11" />
    case "success":
      return <IconCircleCheck {...iconProps} className="text-green-11" />
    case "danger":
      return <IconAlertCircle {...iconProps} className="text-red-11" />
    case "warning":
      return <IconAlertTriangle {...iconProps} className="text-amber-11" />
  }
}
