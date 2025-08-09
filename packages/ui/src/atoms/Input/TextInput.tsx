import type { ComponentPropsWithRef, FC } from "react"
import { cn } from "../../utils"
import { Text } from "../Typography/Text"

export type TextInputProps = ComponentPropsWithRef<"input"> & {
  placeholder?: string
  label?: string
  error?: boolean | string
}

export const TextInput: FC<TextInputProps> = ({ label, error, ref, ...props }) => {
  const hasError = Boolean(error)
  const hasTextError = typeof error === "string"

  return (
    <div className="flex flex-col gap-1 transition-colors">
      {label && (
        <Text
          element="label"
          htmlFor={props.id}
          className={cn("text-black dark:text-white", props.disabled && "text-gray-500 dark:text-stone-500")}
        >
          {label}{" "}
          {props.required && (
            <Text element="span" className="text-red-600 dark:text-red-400">
              *
            </Text>
          )}
        </Text>
      )}

      <Text
        element="input"
        type="text"
        {...props}
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border text-left",
          "text-black dark:text-white",
          "placeholder:text-gray-500 dark:placeholder:text-stone-500",
          "border-gray-200 px-3 py-2 text-sm ring-offset-background",
          "dark:border-stone-800 dark:bg-stone-900",
          "focus:outline-hidden focus:ring-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError && [
            "text-red-600 border-red-300 focus:ring-red-400 focus:border-red-400",
            "dark:text-red-400 dark:border-red-700 dark:focus:ring-red-600 dark:focus:border-red-600",
          ]
        )}
      />

      {hasTextError && (
        <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
          {error}
        </Text>
      )}
    </div>
  )
}
