"use client"

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import * as React from "react"
import { cn } from "../../utils"
import { Icon } from "../Icon/Icon"

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "h-5 w-5 rounded-full border focus:outline-hidden focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
      "text:fill-gray-200 border-gray-400 text-black hover:border-gray-300 focus:ring-gray-800",
      "dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:hover:border-stone-600 dark:focus:ring-white",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="relative grid place-items-center focus:ring-0 focus:outline-hidden">
      <Icon icon="tabler:circle-filled" width={16} className="text-blue-400 dark:text-sky-700" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
))
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName
