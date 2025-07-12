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
    className={cn("text-foreground bg-gray-200 inline-flex items-center justify-center rounded-md p-1", className)}
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
      "rdx-state-active:text-black rdx-state-active:bg-gray-100 text-gray-800 rdx-state-active:shadow-xs inline-flex  min-w-[100px] items-center justify-center rounded-[0.185rem]  px-3 py-1.5 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
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
  <TabsPrimitive.Content className={cn("mt-2 rounded-md border border-gray-200 p-6", className)} {...props} ref={ref} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName
