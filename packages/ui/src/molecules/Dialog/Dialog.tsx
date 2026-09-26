"use client"

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  Dialog as ShadcnDialog,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
  DialogClose as ShadcnDialogClose,
  type DialogContent as ShadcnDialogContent,
} from "#components/dialog"
import { alertDialogSizeExtensionClasses } from "#lib/alert-dialog-classes"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import type { ComponentProps } from "react"
import { Button, type ButtonProps } from "../../atoms/Button/Button"
import { resolveAsChildRender } from "../../lib/as-child"
import { cn } from "../../utils"

export const Dialog = ShadcnDialog
export { DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal }

type TriggerProps = ComponentProps<typeof ShadcnDialogTrigger> & {
  asChild?: boolean
}

export function DialogTrigger({ asChild, children, ...props }: TriggerProps) {
  const resolved = resolveAsChildRender({ asChild, children })

  return (
    <ShadcnDialogTrigger render={resolved.render} {...props}>
      {resolved.children}
    </ShadcnDialogTrigger>
  )
}

type DialogContentProps = Omit<ComponentProps<typeof ShadcnDialogContent>, "size"> & {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  onOutsideClick?: () => void
}

export function DialogContent({ size = "md", onOutsideClick, className, ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay onClick={onOutsideClick} />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-size={size}
        className={cn(
          "group/dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-popover p-5 text-popover-foreground shadow-overlay ring-1 ring-border/40 duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:p-6",
          "data-[size=xs]:max-w-xs data-[size=sm]:max-w-sm data-[size=md]:max-w-md data-[size=lg]:max-w-lg data-[size=xl]:max-w-xl data-[size=2xl]:max-w-2xl",
          alertDialogSizeExtensionClasses.lg,
          className
        )}
        {...props}
      />
    </DialogPortal>
  )
}

type TitleProps = ComponentProps<typeof ShadcnDialogTitle> & {
  asChild?: boolean
}

export function DialogTitle({ asChild, children, className, ...props }: TitleProps) {
  const resolved = resolveAsChildRender({ asChild, children })

  if (resolved.render) {
    return <DialogPrimitive.Title className={className} render={resolved.render} {...props} />
  }

  return (
    <ShadcnDialogTitle className={className} {...props}>
      {resolved.children}
    </ShadcnDialogTitle>
  )
}

export function DialogClose({
  className,
  color,
  variant = "ghost",
  size = "lg",
  ...props
}: ComponentProps<typeof ShadcnDialogClose> & ButtonProps) {
  return (
    <ShadcnDialogClose
      render={<Button className={cn("p-2", className)} variant={variant} size={size} color={color} />}
      {...props}
    />
  )
}
