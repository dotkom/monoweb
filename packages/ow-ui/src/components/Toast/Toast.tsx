import { css } from "@stitches/react"
import { FC, ReactNode } from "react"
import { IoCloseOutline } from "react-icons/io5"
import { AlertIcon } from "../Alert/AlertIcon"

export interface ToastProps {
  monochrome?: boolean
  status: "info" | "warning" | "success" | "danger"
  children: ReactNode
}

const Toast: FC<ToastProps> = ({ monochrome, status, children }) => {
  const styleCheck = monochrome ? undefined : status
  return (
    <div className={styles.base({ color: styleCheck })}>
      <div className={styles.flex()}>
        <AlertIcon status={status} monochrome={!monochrome}></AlertIcon>
        {children}
      </div>
      {/* The monochrome value is inverted because we want a white or black icon with colored background*/}

      <button className={styles.button()}>
        <IoCloseOutline aria-hidden className={styles.close({ color: styleCheck })}></IoCloseOutline>
      </button>
    </div>
  )
}

const styles = {
  base: css({
    display: "flex",
    alignItems: "center",
    width: "352px",
    height: "22px",
    padding: "22px",
    borderRadius: 5,
    backgroundColor: "white",
    color: "$gray1",
    boxShadow: `0px 8px 12px rgba(9, 30, 66, 0.15), 0px 0px 1px rgba(9, 30, 66, 0.31)`,
    variants: {
      color: {
        danger: {
          backgroundColor: "$red3",
          color: "$gray12",
        },
        warning: {
          backgroundColor: "$orange3",
        },
        info: {
          backgroundColor: "$info3",
          color: "$gray12",
        },
        success: {
          backgroundColor: "$green3",
          color: "$gray12",
        },
      },
    },
  }),
  close: css({
    width: "24px",
    height: "24px",
    color: "$gray1",
    variants: {
      color: {
        danger: {
          backgroundColor: "$red3",
          color: "$gray12",
        },
        warning: {
          backgroundColor: "$orange3",
        },
        info: {
          backgroundColor: "$info3",
          color: "$gray12",
        },
        success: {
          backgroundColor: "$green3",
          color: "$gray12",
        },
      },
    },
  }),
  button: css({
    border: "none",
    backgroundColor: "transparent",
    marginLeft: "auto",
    "&:hover": {
      transform: "translateY(-1px)",
      color: "$gray3",
      cursor: "pointer",
    },
    "&:active": {
      transform: "translateY(1px)",
      color: "$gray2",
    },
  }),
  flex: css({
    display: "flex",
  }),
}

export default Toast
