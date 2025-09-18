"use client"

import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as React from "react"
import { cn } from "../../utils"

export const Tabs = TabsPrimitive.Root

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "border inline-flex items-center gap-1 justify-center rounded-lg p-1.5",
      "bg-white border-gray-200",
      "dark:bg-stone-800 dark:border-stone-700",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    className={cn(
      "font-body rdx-state-active:shadow-xs inline-flex min-w-24 min-h-9 items-center justify-center rounded-sm px-2.5 py-1.5",
      "text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
      "text-gray-700 hover:bg-gray-100 hover:text-black rdx-state-active:bg-gray-200 rdx-state-active:text-black",
      "dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-white dark:rdx-state-active:bg-stone-600 dark:rdx-state-active:text-white",
      className
    )}
    {...props}
    ref={ref}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content className={cn("font-body mt-4", className)} {...props} ref={ref} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName
