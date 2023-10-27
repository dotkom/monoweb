import { cva } from "cva"

import * as React from "react"
import { cn } from "../../utils"
import { AlertIcon } from "../Alert/AlertIcon"
import { Label } from "../Label"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  status?: "success" | "warning" | "danger"
  error?: string
  message?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, status, message, label, ...props }, ref) => {
    return (
      <div className="grid w-full gap-2">
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <textarea
          className={cn(
            "border-slate-6 focus:riled:cursor-not-allowed placeholder:text-slate-9 focus:ring-slate-8 flex h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:opacity-50 focus:ring-2 focus:ring-brand",
            statusVariants({ status: status ? status : error ? "danger" : undefined }), // Error implies danger
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
)
Textarea.displayName = "Textarea"

export { Textarea }

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
