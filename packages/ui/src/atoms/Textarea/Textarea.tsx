"use client"

import { Textarea as ShadcnTextarea } from "#components/textarea"
import type { ComponentProps, FC, ReactNode } from "react"
import { Label } from "../Label/Label"
import { cn } from "../../utils"
import { Text } from "../Typography/Text"

export type TextareaProps = ComponentProps<typeof ShadcnTextarea> & {
  label?: string
  description?: ReactNode
  error?: boolean | string
}

export const Textarea: FC<TextareaProps> = ({ label, description, error, ref, className, id, ...props }) => {
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

      <ShadcnTextarea
        id={id}
        {...props}
        ref={ref}
        aria-invalid={hasError || undefined}
        className={cn(
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
