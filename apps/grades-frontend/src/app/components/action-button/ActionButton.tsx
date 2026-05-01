"use client"

import { Button, cn, type ButtonProps } from "@dotkomonline/ui"

type ActionButtonProps = {
  isActive?: boolean
  surface?: "default" | "glass"
} & Omit<ButtonProps, "variant">

export const ActionButton = ({ isActive, surface = "default", className, children, ...props }: ActionButtonProps) => {
  const glassSurfaceClassName = cn(
    "bg-white/60 dark:bg-stone-700/35",
    "ring-1 ring-inset ring-neutral-200/80 dark:ring-stone-700/80",
    "hover:bg-white/80 dark:hover:bg-stone-700/60"
  )

  const defaultHoverClassName = "hover:bg-neutral-100 dark:hover:bg-stone-700"

  const activeClassName = cn(
    "bg-neutral-100 text-neutral-900 dark:bg-stone-700 dark:text-white",
    "ring-1 ring-inset ring-neutral-200/80 dark:ring-stone-700/80",
    "hover:bg-neutral-200 dark:hover:bg-stone-600"
  )

  return (
    <Button
      variant="text"
      {...props}
      className={cn(
        "text-neutral-800 dark:text-white",
        "transition-colors",
        surface === "glass" && glassSurfaceClassName,
        defaultHoverClassName,
        isActive && activeClassName,
        className
      )}
    >
      {children}
    </Button>
  )
}

export const IconActionButton = ({
  isActive,
  surface = "default",
  className,
  children,
  ...props
}: ActionButtonProps) => {
  return (
    <ActionButton
      isActive={isActive}
      surface={surface}
      className={cn("inline-flex size-10 items-center justify-center rounded-lg", "bg-transparent p-0", className)}
      {...props}
    >
      {children}
    </ActionButton>
  )
}

export const PillActionButton = ({
  isActive,
  surface = "default",
  className,
  children,
  ...props
}: ActionButtonProps) => {
  return (
    <ActionButton
      isActive={isActive}
      surface={surface}
      className={cn("inline-flex items-center justify-center rounded-full px-3.5 py-2 text-sm", className)}
      {...props}
    >
      {children}
    </ActionButton>
  )
}
