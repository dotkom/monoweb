"use client"

import * as SelectPrimitive from "@radix-ui/react-select"
import type * as React from "react"

import { cn } from "../../utils"
import { Icon } from "../Icon/Icon"

export const Select = SelectPrimitive.Root

export const SelectGroup = SelectPrimitive.Group

export const SelectValue = SelectPrimitive.Value

type SelectTriggerProps = React.ComponentPropsWithRef<typeof SelectPrimitive.Trigger>
export const SelectTrigger = ({ className, children, ref, ...props }: SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "font-body flex h-10 w-full items-center justify-between rounded-md border text-left",
      "border-gray-400 bg-slate-50 px-3 py-2 text-sm ring-offset-background",
      "dark:border-stone-800 dark:bg-stone-900",
      "focus:outline-hidden focus:ring-2",
      "focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      "[&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <Icon icon="tabler:chevron-down" className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

type SelectScrollUpButtonProps = React.ComponentPropsWithRef<typeof SelectPrimitive.ScrollUpButton>
export const SelectScrollUpButton = ({ className, ref, ...props }: SelectScrollUpButtonProps) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <Icon icon="tabler:chevron-up" className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
)
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

type SelectScrollDownButtonProps = React.ComponentPropsWithRef<typeof SelectPrimitive.ScrollDownButton>
export const SelectScrollDownButton = ({ className, ref, ...props }: SelectScrollDownButtonProps) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <Icon icon="tabler:chevron-down" className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
)
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

type SelectContentProps = React.ComponentPropsWithRef<typeof SelectPrimitive.Content>
export const SelectContent = ({ className, children, position = "popper", ref, ...props }: SelectContentProps) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "font-body relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem]",
        "overflow-y-auto overflow-x-hidden rounded-md border border-gray-400 bg-slate-50 text-black",
        "dark:border-stone-800 dark:bg-stone-900 dark:text-white",
        "shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95",
        "data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
)
SelectContent.displayName = SelectPrimitive.Content.displayName

type SelectLabelProps = React.ComponentPropsWithRef<typeof SelectPrimitive.Label>
export const SelectLabel = ({ className, ref, ...props }: SelectLabelProps) => (
  <SelectPrimitive.Label ref={ref} className={cn("font-body py-1.5 pl-8 pr-2 text-sm font-medium", className)} {...props} />
)
SelectLabel.displayName = SelectPrimitive.Label.displayName

type SelectItemProps = React.ComponentPropsWithRef<typeof SelectPrimitive.Item>
export const SelectItem = ({ className, children, ref, ...props }: SelectItemProps) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "font-body relative flex w-full cursor-default select-none items-center",
      "rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-gray-200 dark:focus:bg-stone-800",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
      <SelectPrimitive.ItemIndicator>
        <Icon icon="tabler:check" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
)
SelectItem.displayName = SelectPrimitive.Item.displayName

type SelectSeparatorProps = React.ComponentPropsWithRef<typeof SelectPrimitive.Separator>
export const SelectSeparator = ({ className, ref, ...props }: SelectSeparatorProps) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-400 dark:bg-stone-700", className)}
    {...props}
  />
)
SelectSeparator.displayName = SelectPrimitive.Separator.displayName
