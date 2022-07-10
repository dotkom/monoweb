import { FC } from "react"
import { css } from "../../config/stitches.config"
import { IoAlertCircle, IoCheckmarkCircle, IoInformationCircle, IoWarning } from "react-icons/io5"

interface AlertIconProps {
  status: "info" | "warning" | "success" | "danger"
  className?: string
}

export const WhiteAlertIcon: FC<AlertIconProps> = ({ status, className }) => {
  const style = `${styles.base({ status })} ${className}`
  switch (status) {
    case "info":
      return <IoInformationCircle className={style} />
    case "success":
      return <IoCheckmarkCircle className={style} />
    case "danger":
      return <IoAlertCircle className={style} />
    case "warning":
      return <IoWarning className={style} />
  }
}
const styles = {
  base: css({
    marginRight: "$2",
    width: "24px",
    height: "24px",
    variants: {
      status: {
        info: {
          color: "$gray12",
        },
        success: {
          color: "$gray12",
        },
        warning: {
          color: "$gray1",
        },
        danger: {
          color: "$gray12",
        },
      },
    },
  }),
}
