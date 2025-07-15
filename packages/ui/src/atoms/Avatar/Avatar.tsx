"use client"

import * as AvatarPrimitive from "@radix-ui/react-avatar"
import type { ComponentPropsWithRef, FC } from "react"
import { cn } from "../../utils"

export const Avatar: FC<ComponentPropsWithRef<typeof AvatarPrimitive.Root>> = ({ className, ref, ...props }) => {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  )
}

export const AvatarImage: FC<ComponentPropsWithRef<typeof AvatarPrimitive.Image>> = ({ className, ref, ...props }) => {
  return <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
}

export const AvatarFallback: FC<ComponentPropsWithRef<typeof AvatarPrimitive.Fallback>> = ({
  className,
  ref,
  ...props
}) => {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn("bg-slate-950 flex h-full w-full items-center justify-center rounded-full", className)}
      {...props}
    />
  )
}
