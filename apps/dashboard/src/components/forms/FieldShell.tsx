"use client"

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@dotkomonline/ui"
import type { ReactNode } from "react"
import { RequiredMark } from "../RequiredMark"

type FieldShellProps = {
  id: string
  label?: string
  description?: ReactNode
  required?: boolean
  error?: string
  children: ReactNode
  orientation?: "vertical" | "horizontal" | "responsive"
}

export function FieldShell({
  id,
  label,
  description,
  required,
  error,
  children,
  orientation = "vertical",
}: FieldShellProps) {
  return (
    <Field data-invalid={error ? true : undefined} orientation={orientation}>
      {(label || description) && (
        <FieldContent>
          {label && (
            <FieldLabel htmlFor={id}>
              {label}
              {required && <RequiredMark />}
            </FieldLabel>
          )}
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      )}
      {children}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

export function getFieldErrorMessage(message: unknown): string | undefined {
  return typeof message === "string" ? message : undefined
}
