"use client"

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import type { ComponentPropsWithRef, ComponentPropsWithoutRef, FC } from "react"
import { Button } from "../../atoms/Button/Button"
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
        "animate-in fade-in bg-slate-50/50 fixed inset-0 z-50 backdrop-blur-xs transition-opacity",
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
          "animate-in fade-in-90 slide-in-from-bottom-10 sm:zoom-in-90 sm:slide-in-from-bottom-0 bg-gray-200 fixed z-50 grid w-full max-w-[95%] sm:max-w-lg scale-100 gap-4 p-6 opacity-100 rounded-lg md:w-full",
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
  return <AlertDialogPrimitive.Description ref={ref} className={cn("text-gray-900 text-md", className)} {...props} />
}

export type AlertDialogActionProps = Omit<ComponentPropsWithRef<typeof AlertDialogPrimitive.Action>, "color"> & {
  destructive?: boolean
}

export const AlertDialogAction: FC<AlertDialogActionProps> = ({ className, ref, destructive, ...props }) => {
  return <Button element={AlertDialogPrimitive.Action} {...props} ref={ref} color={destructive ? "red" : undefined} />
}

export const AlertDialogCancel: FC<Omit<ComponentPropsWithRef<typeof AlertDialogPrimitive.Cancel>, "color">> = ({
  className,
  ref,
  ...props
}) => {
  return (
    <Button element={AlertDialogPrimitive.Cancel} className={className} {...props} variant="text" size="lg" ref={ref} />
  )
}
