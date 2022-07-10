import { FC } from "react"
import { css } from "../../config/stitches.config"
import { AlertIcon } from "./AlertIcon"

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
}
