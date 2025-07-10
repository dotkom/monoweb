"use client"

import { cva } from "cva"
import type { ComponentPropsWithRef, FC } from "react"
import { AlertIcon } from "../../molecules/Alert/AlertIcon"
import { cn } from "../../utils"
import { Label } from "../Label/Label"

export type TextareaProps = ComponentPropsWithRef<"textarea"> & {
  label?: string
  status?: "danger" | "success" | "warning"
  error?: string
  message?: string
}

export const Textarea: FC<TextareaProps> = ({ className, error, status, message, label, ref, ...props }) => {
  return (
    <div className="grid w-full gap-2">
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <textarea
        className={cn(
          "border-slate-6 focus:riled:cursor-not-allowed placeholder:text-slate-9 focus:ring-brand flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-2 disabled:opacity-50",
          statusVariants({ status: status ?? (error ? "danger" : undefined) }),
          className
        )}
        ref={ref}
        {...props}
      />
      {message && <p className={displayMessage({ status })}>{message}</p>}
      {error && (
        <div className={displayMessage({ status: "danger" })}>
          <AlertIcon size={20} status="danger" className="mr-1" />
          <p>
            <span className="font-bold">Error:&nbsp;</span>
            {error}
          </p>
        </div>
      )}
    </div>
  )
}

const statusVariants = cva("", {
  variants: {
    status: {
      danger: "border-red-7",
      error: "border-red-7",
      warning: "border-amber-7",
      success: "border-green-7",
    },
  },
})

const displayMessage = cva("text-sm inline-flex", {
  variants: {
    status: {
      error: "text-red-11",
      danger: "text-red-11",
      success: "text-green-11",
      warning: "text-amber-11",
    },
  },
})
