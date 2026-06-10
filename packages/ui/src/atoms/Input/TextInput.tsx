import type { ComponentPropsWithRef, FC, ReactNode } from "react"
import { Input } from "#components/input"
import { Label } from "#components/label"
import { cn } from "../../utils"
import { Text } from "../Typography/Text"

export type TextInputProps = ComponentPropsWithRef<"input"> & {
  placeholder?: string
  label?: string
  description?: ReactNode
  error?: boolean | string
  className?: string
}

export const TextInput: FC<TextInputProps> = ({ label, description, error, ref, className, id, ...props }) => {
  const hasError = Boolean(error)
  const hasTextError = typeof error === "string"

  return (
    <div className="flex flex-col gap-3 transition-colors">
      {label && (
        <Label
          htmlFor={id}
          className={cn("text-black dark:text-white", props.disabled && "text-gray-500 dark:text-stone-400")}
        >
          {label}{" "}
          {props.required && (
            <Text element="span" className="text-red-600 dark:text-red-400">
              *
            </Text>
          )}
        </Label>
      )}

      {description &&
        (typeof description === "string" || typeof description === "number" ? (
          <Text className="text-gray-500 dark:text-stone-400 text-xs">{description}</Text>
        ) : (
          description
        ))}

      <Input
        id={id}
        type="text"
        {...props}
        ref={ref}
        aria-invalid={hasError || undefined}
        className={cn(
          "h-10 rounded-lg border-gray-200 dark:border-stone-700 dark:bg-stone-800",
          hasError && [
            "text-red-600 border-red-300 focus-visible:ring-red-400 focus-visible:border-red-400",
            "dark:text-red-400 dark:border-red-700 dark:focus-visible:ring-red-600 dark:focus-visible:border-red-600",
          ],
          className
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
