import { ComponentPropsWithoutRef, forwardRef } from "react"
import * as Label from "@radix-ui/react-label"
import { css } from "../../config/stitches.config"
import { AlertIcon } from "../Alert/AlertIcon"

export type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  label?: string
} & (
    | {
        status: "success" | "danger"
        message: string
      }
    | {
        status?: undefined
        message?: undefined
      }
  )

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const { id, message, label, status, ...rest } = props

  return (
    <div className={styles.inputContainer()}>
      {label && (
        <Label.Root htmlFor={id} className={styles.label()}>
          {label}
        </Label.Root>
      )}
      <textarea className={styles.base({ status })} ref={ref} id={id} {...rest} />
      {message && (
        <div className={styles.messageContainer()}>
          <AlertIcon status={status} />
          <span className={styles.message({ status })}>{message}</span>
        </div>
      )}
    </div>
  )
})

const styles = {
  base: css({
    outline: "none",
    resize: "none",
    padding: "$2",
    border: "2px solid $gray10",
    fontFamily: "$body",
    borderRadius: "$1",
    backgroundColor: "$gray12",
    "&:disabled": {
      backgroundColor: "$gray11",
      cursor: "not-allowed",
    },
    "&:focus": {
      borderColor: "$info4",
    },
    variants: {
      status: {
        danger: {
          borderColor: "$red5",
        },
        success: {
          borderColor: "$green5",
        },
      },
    },
  }),
  label: css({
    fontWeight: "bold",
    fontFamily: "$body",
  }),
  inputContainer: css({
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "$1",
  }),
  message: css({
    fontWeight: "600",
    variants: {
      status: {
        danger: {
          color: "$red0",
        },
        success: {
          color: "$green0",
        },
      },
    },
  }),
  messageContainer: css({
    fontSize: "$md",
    display: "flex",
    alignItems: "center",
  }),
}
