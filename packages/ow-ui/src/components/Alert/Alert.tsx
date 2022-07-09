import { FC } from "react"
import { FiCheckCircle, FiAlertTriangle, FiAlertOctagon, FiInfo } from "react-icons/fi"
import { css } from "../../config/stitches.config"

export interface AlertProps {
  status: "info" | "warning" | "success" | "danger"
  text: string
  showIcon?: boolean
}

export const Alert: FC<AlertProps> = ({ status, text, showIcon = true }) => {
  return (
    <div className={styles.root({ status })}>
      {showIcon && <AlertIcon status={status} />}
      {text}
    </div>
  )
}

interface AlertIconProps {
  status: AlertProps["status"]
}

export const AlertIcon: FC<AlertIconProps> = ({ status }) => {
  switch (status) {
    case "info":
      return <FiInfo className={styles.icon({ status })} />
    case "success":
      return <FiCheckCircle className={styles.icon({ status })} />
    case "danger":
      return <FiAlertOctagon className={styles.icon({ status })} />
    case "warning":
      return <FiAlertTriangle className={styles.icon({ status })} />
  }
}
const styles = {
  root: css({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "$2",
    fontSize: "$md",
    fontWeight: "semibold",
    borderRadius: "$2", // XD
    variants: {
      status: {
        info: {
          backgroundColor: "$info12",
          color: "$info1",
        },
        success: {
          backgroundColor: "$green12",
          color: "$green1",
        },
        warning: {
          backgroundColor: "$orange12",
          color: "$orange1",
        },
        danger: {
          backgroundColor: "$red12",
          color: "$red1",
        },
      },
    },
  }),
  icon: css({
    marginRight: "$2",
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
}
