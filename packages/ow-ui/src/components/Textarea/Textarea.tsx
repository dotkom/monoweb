import * as Label from "@radix-ui/react-label"
import { ComponentPropsWithoutRef, forwardRef } from "react"

import { AlertIcon } from "../Alert/AlertIcon"
import { cva } from "cva"
import { Text } from "../Typography"

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
    <div className="flex w-full flex-col gap-1">
      {label && (
        <Label.Root htmlFor={id} className="font-bold">
          {label}
        </Label.Root>
      )}
      <textarea className={base({ status })} ref={ref} id={id} {...rest} />
      {message && (
        <div className="text-md flex items-center">
          <AlertIcon status={status} />
          <Text className={displayMessage({ status })}>{message}</Text>
        </div>
      )}
    </div>
  )
})

const base = cva(
  "outline-none resize-none p-2 border border-slate-10 bg-slate-12 disabled:bg-slate-11 disabled:cursor-not-allowed focus:border-info-4",
  {
    variants: {
      status: {
        danger: "border-red-5",
        success: "border-green-5",
      },
    },
  }
)

const displayMessage = cva("font-bold", {
  variants: {
    status: {
      danger: "text-red-0",
      success: "text-green-0",
    },
  },
})
