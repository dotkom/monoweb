"use client"

import {
  AlertDialog as ShadcnAlertDialog,
  AlertDialogAction as ShadcnAlertDialogAction,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle as ShadcnAlertDialogTitle,
  AlertDialogTrigger as ShadcnAlertDialogTrigger,
} from "#components/alert-dialog"
import type { AlertDialogContent as ShadcnAlertDialogContent } from "#components/alert-dialog"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import type { ComponentProps } from "react"
import { Button, type ButtonProps } from "../../atoms/Button/Button"
import { alertDialogSizeExtensionClasses } from "#lib/alert-dialog-classes"
import { resolveAsChildRender } from "../../lib/as-child"
import { cn } from "../../utils"

export const AlertDialog = ShadcnAlertDialog
export { AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal }

type TriggerProps = ComponentProps<typeof ShadcnAlertDialogTrigger> & {
  asChild?: boolean
}

export function AlertDialogTrigger({ asChild, children, ...props }: TriggerProps) {
  const resolved = resolveAsChildRender({ asChild, children })

  return (
    <ShadcnAlertDialogTrigger render={resolved.render} {...props}>
      {resolved.children}
    </ShadcnAlertDialogTrigger>
  )
}

type AlertDialogContentProps = Omit<ComponentProps<typeof ShadcnAlertDialogContent>, "size"> & {
  size?: "default" | "sm" | "lg"
  onOutsideClick?: () => void
}

export function AlertDialogContent({ size = "default", onOutsideClick, className, ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay onClick={onOutsideClick} />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-popover p-5 text-popover-foreground shadow-overlay ring-1 ring-border/40 duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:p-6",
          "data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm",
          alertDialogSizeExtensionClasses.lg,
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

type TitleProps = ComponentProps<typeof ShadcnAlertDialogTitle> & {
  asChild?: boolean
}

export function AlertDialogTitle({ asChild, children, className, ...props }: TitleProps) {
  const resolved = resolveAsChildRender({ asChild, children })

  if (resolved.render) {
    return <AlertDialogPrimitive.Title className={className} render={resolved.render} {...props} />
  }

  return (
    <ShadcnAlertDialogTitle className={className} {...props}>
      {resolved.children}
    </ShadcnAlertDialogTitle>
  )
}

export type AlertDialogActionProps = ComponentProps<typeof ShadcnAlertDialogAction> & {
  destructive?: boolean
}

export function AlertDialogAction({ className, destructive, variant, ...props }: AlertDialogActionProps) {
  return <ShadcnAlertDialogAction className={className} variant={destructive ? "destructive" : variant} {...props} />
}

export function AlertDialogCancel({
  className,
  color,
  variant = "ghost",
  size = "lg",
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Close> & ButtonProps) {
  return (
    <AlertDialogPrimitive.Close
      render={<Button className={cn("p-2", className)} variant={variant} size={size} color={color} />}
      {...props}
    />
  )
}
