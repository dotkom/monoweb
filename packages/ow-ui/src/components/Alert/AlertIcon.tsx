import { FC } from "react"
import { IoAlertCircle, IoCheckmarkCircle, IoInformationCircle, IoWarning } from "react-icons/io5"

import { css } from "../../config/stitches.config"

interface AlertIconProps {
  status: "info" | "warning" | "success" | "danger"
  className?: string
  monochrome?: boolean
}

export const AlertIcon: FC<AlertIconProps> = ({ status, className, monochrome }) => {
  const style = () =>
    monochrome ? `${styles.monochrome({ status })} ${className}` : `${styles.base({ status })} ${className}`
  switch (status) {
    case "info":
      return <IoInformationCircle className={style()} />
    case "success":
      return <IoCheckmarkCircle className={style()} />
    case "danger":
      return <IoAlertCircle className={style()} />
    case "warning":
      return <IoWarning className={style()} />
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
          color: "$info3",
        },
        success: {
          color: "$green3",
        },
        warning: {
          color: "$orange3",
        },
        danger: {
          color: "$red3",
        },
      },
    },
  }),
  monochrome: css({
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
