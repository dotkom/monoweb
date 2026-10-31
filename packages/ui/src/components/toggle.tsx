"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { IconCheck } from "@tabler/icons-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#lib/utils"

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-muted",
      },
      size: {
        default: "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
      color: {
        default: "",
        blue: [
          "hover:bg-blue-50 aria-pressed:bg-blue-100 data-[state=on]:bg-blue-100",
          "dark:hover:bg-sky-900/20 dark:aria-pressed:bg-sky-900/50 dark:data-[state=on]:bg-sky-900/50",
        ],
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        color: "blue",
        // Joined groups (spacing 0) share borders, so a colored border on one item would look uneven
        class: [
          "not-data-[spacing=0]:aria-pressed:border-blue-200 not-data-[spacing=0]:aria-pressed:text-blue-900",
          "dark:not-data-[spacing=0]:aria-pressed:border-sky-800 dark:not-data-[spacing=0]:aria-pressed:text-sky-100",
        ],
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      color: "default",
    },
  }
)

type ToggleIndicator = "check"

function ToggleCheckIndicator() {
  return (
    <span
      data-slot="toggle-indicator"
      aria-hidden="true"
      className={cn(
        "relative h-3.5 w-0 shrink-0 overflow-hidden transition-[width] duration-100 ease-out motion-reduce:transition-none",
        "group-aria-pressed/toggle:w-4"
      )}
    >
      <IconCheck
        className={cn(
          "absolute top-0 -left-0.5 size-3.5 scale-50 opacity-0 transition-[opacity,scale] duration-100 ease-out motion-reduce:transition-none",
          "group-aria-pressed/toggle:scale-100 group-aria-pressed/toggle:opacity-100"
        )}
      />
    </span>
  )
}

function Toggle({
  className,
  variant = "default",
  size = "default",
  color = "default",
  indicator,
  children,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants> & { indicator?: ToggleIndicator }) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, color }), indicator && "gap-0", className)}
      {...props}
    >
      {indicator === "check" && <ToggleCheckIndicator />}
      {children}
    </TogglePrimitive>
  )
}

export { Toggle, ToggleCheckIndicator, toggleVariants, type ToggleIndicator }
