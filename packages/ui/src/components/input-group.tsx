"use client"

import type * as React from "react"
import type { VariantProps } from "class-variance-authority"

import { Button } from "#components/button"
import { Input } from "#components/input"
import { Textarea } from "#components/textarea"
import {
  inputGroupAddonVariants,
  inputGroupButtonVariants,
  inputGroupInputClass,
  inputGroupTextareaClass,
  inputGroupTextClass,
  inputGroupVariants,
} from "#lib/input-classes"
import { cn } from "#lib/utils"

function InputGroup({
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupVariants>) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: this should be a div
    <div data-slot="input-group" role="group" className={cn(inputGroupVariants({ variant }), className)} {...props} />
  )
}

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: this should be a div
    // biome-ignore lint/a11y/useKeyWithClickEvents: idk this is from shadcn
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("button")) {
          return
        }
        event.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset"
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn(inputGroupTextClass, className)} {...props} />
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      variant="secondary"
      className={cn(inputGroupInputClass, className)}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <Textarea data-slot="input-group-control" className={cn(inputGroupTextareaClass, className)} {...props} />
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea }
