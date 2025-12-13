"use client"

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import type { ComponentPropsWithRef, ComponentPropsWithoutRef, FC } from "react"
import { Button, type ButtonProps } from "../../atoms/Button/Button"
import { cn } from "../../utils"

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger

export const AlertDialogPortal: FC<ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Portal>> = ({
  children,
  ...props
}) => {
  return (
    <AlertDialogPrimitive.Portal {...props}>
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-center">{children}</div>
    </AlertDialogPrimitive.Portal>
  )
}

export const AlertDialogOverlay: FC<ComponentPropsWithRef<typeof AlertDialogPrimitive.Overlay>> = ({
  className,
  ref,
  ...props
}) => {
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "animate-in fade-in bg-gray-50/50 dark:bg-stone-950/50 fixed inset-0 z-50 backdrop-blur-xs transition-opacity",
        className
      )}
      {...props}
      ref={ref}
    />
  )
}

export type AlertDialogContentProps = ComponentPropsWithRef<typeof AlertDialogPrimitive.Content> & {
  onOutsideClick?: () => void
}

export const AlertDialogContent: FC<AlertDialogContentProps> = ({ className, ref, onOutsideClick, ...props }) => {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay onClick={onOutsideClick} />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          "animate-in fade-in-90 slide-in-from-bottom-10 sm:zoom-in-90 sm:slide-in-from-bottom-0",
          "bg-white dark:bg-stone-800 fixed z-50 drop-shadow-lg scale-100 opacity-100",
          "flex flex-col gap-4 p-4 rounded-lg",
          "w-full max-w-[95%] sm:max-w-2xl md:w-full",
          "min-h-[25dvh] max-h-[75dvh] overflow-y-auto",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

export const AlertDialogHeader: FC<ComponentPropsWithRef<"div">> = ({ className, ref, ...props }) => {
  return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
}

export const AlertDialogFooter: FC<ComponentPropsWithRef<"div">> = ({ className, ref, ...props }) => {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}

export const AlertDialogTitle: FC<ComponentPropsWithRef<typeof AlertDialogPrimitive.Title>> = ({
  className,
  ref,
  ...props
}) => {
  return <AlertDialogPrimitive.Title ref={ref} className={className} {...props} />
}

export const AlertDialogDescription: FC<ComponentPropsWithRef<typeof AlertDialogPrimitive.Description>> = ({
  className,
  ref,
  ...props
}) => {
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn("text-gray-900 dark:text-stone-100/80 text-md", className)}
      {...props}
    />
  )
}

export type AlertDialogActionProps = Omit<ComponentPropsWithRef<typeof AlertDialogPrimitive.Action>, "color"> & {
  destructive?: boolean
}

export const AlertDialogAction: FC<AlertDialogActionProps> = ({ className, ref, destructive, ...props }) => {
  return <Button element={AlertDialogPrimitive.Action} {...props} ref={ref} color={destructive ? "red" : undefined} />
}

export const AlertDialogCancel: FC<ComponentPropsWithRef<typeof AlertDialogPrimitive.Cancel> & ButtonProps> = ({
  className,
  color,
  ref,
  ...props
}) => {
  return (
    <Button
      element={AlertDialogPrimitive.Cancel}
      className={cn("p-2", className)}
      {...props}
      variant={props.variant ?? "text"}
      size={props.size ?? "lg"}
      color={color}
      ref={ref}
    />
  )
}
