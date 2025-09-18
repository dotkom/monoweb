"use client"
import type { ComponentPropsWithRef, FC } from "react"
import { AlertIcon } from "../../molecules/Alert/AlertIcon"
import { cn } from "../../utils"
import { Text } from "../Typography/Text"

export type TextareaProps = ComponentPropsWithRef<"textarea"> & {
  label?: string
  error?: string
  message?: string
}

export const Textarea: FC<TextareaProps> = ({ className, error, message, label, ref, ...props }) => {
  return (
    <div className="grid w-full gap-2">
      {label && (
        <Text
          element="label"
          htmlFor={props.id}
          className={cn("text-black dark:text-white", props.disabled && "text-gray-500 dark:text-stone-400")}
        >
          {label}
        </Text>
      )}
      <textarea
        className={cn(
          "font-body flex min-h-10 w-full",
          "px-3 py-2 rounded-md text-sm",
          "border border-gray-200 dark:border-stone-700 dark:bg-stone-800",
          "placeholder:text-gray-500 dark:placeholder:text-stone-400",
          "focus:riled:cursor-not-allowed focus:outline-hidden focus:ring-2",
          "disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
      {message && <Text>{message}</Text>}
      {error && (
        <div>
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
