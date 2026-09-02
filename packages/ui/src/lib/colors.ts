import type { badgeVariants } from "#components/badge"
import type { VariantProps } from "class-variance-authority"

export const COLORS = ["brand", "brand-accent", "blue", "green", "yellow", "amber", "orange", "red", "gray"] as const

export type Color = (typeof COLORS)[number]

export type BadgeColorVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

const defaultColorClasses: Record<Color, string> = {
  brand: "border-transparent bg-brand/10 text-brand dark:bg-brand/15 dark:text-brand",
  "brand-accent":
    "border-transparent bg-brand-accent/15 text-brand-accent dark:text-brand-accent dark:bg-brand-accent/18",
  blue: "border-transparent bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  green: "border-transparent bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  yellow: "border-transparent bg-yellow-500/10 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
  amber: "border-transparent bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  orange: "border-transparent bg-orange-500/10 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300",
  red: "border-transparent bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  gray: "border-transparent bg-gray-500/10 text-gray-700 dark:bg-stone-500/25 dark:text-stone-300",
}

const secondaryColorClasses: Record<Color, string> = {
  brand: "border-brand/40 bg-brand/6 text-brand dark:border-brand/60 dark:bg-brand/15 dark:text-brand",
  "brand-accent":
    "border-brand-accent/25 bg-brand-accent/8 text-brand-accent dark:border-brand-accent/55 dark:bg-brand-accent/22 dark:text-brand-accent",
  blue: "border-blue-500/40 bg-blue-500/6 text-blue-700 dark:border-blue-400/55 dark:bg-blue-500/15 dark:text-blue-300",
  green:
    "border-green-500/40 bg-green-500/6 text-green-700 dark:border-green-400/55 dark:bg-green-500/15 dark:text-green-300",
  yellow:
    "border-yellow-500/40 bg-yellow-500/6 text-yellow-800 dark:border-yellow-400/55 dark:bg-yellow-500/15 dark:text-yellow-300",
  amber:
    "border-amber-500/40 bg-amber-500/6 text-amber-800 dark:border-amber-400/55 dark:bg-amber-500/15 dark:text-amber-300",
  orange:
    "border-orange-500/40 bg-orange-500/6 text-orange-800 dark:border-orange-400/55 dark:bg-orange-900/55 dark:text-orange-300",
  red: "border-red-500/40 bg-red-500/6 text-red-700 dark:border-red-400/55 dark:bg-red-500/15 dark:text-red-300",
  gray: "border-gray-500/40 bg-gray-500/6 text-gray-700 dark:border-stone-400/40 dark:bg-stone-500/15 dark:text-stone-300",
}

const outlineColorClasses: Record<Color, string> = {
  brand: "border-brand/30 bg-transparent text-brand dark:border-brand/55",
  "brand-accent": "border-brand-accent/35 bg-transparent text-brand-accent dark:border-brand-accent/55",
  blue: "border-blue-500/40 bg-transparent text-blue-700 dark:border-blue-400/50 dark:text-blue-400",
  green: "border-green-500/40 bg-transparent text-green-700 dark:border-green-400/50 dark:text-green-400",
  yellow: "border-yellow-500/40 bg-transparent text-yellow-800 dark:border-yellow-400/50 dark:text-yellow-400",
  amber: "border-amber-500/40 bg-transparent text-amber-800 dark:border-amber-400/50 dark:text-amber-400",
  orange: "border-orange-500/40 bg-transparent text-orange-800 dark:border-orange-400/50 dark:text-orange-400",
  red: "border-destructive/30 bg-transparent text-destructive dark:border-destructive/55",
  gray: "border-gray-500/40 bg-transparent text-muted-foreground dark:border-stone-400/35",
}

const ghostColorClasses: Record<Color, string> = {
  brand: "border-transparent bg-transparent text-brand dark:text-brand hover:bg-brand/8",
  "brand-accent": "border-transparent bg-transparent text-brand-accent dark:text-brand-accent hover:bg-brand-accent/10",
  blue: "border-transparent bg-transparent text-blue-700 hover:bg-blue-500/8 dark:text-blue-400",
  green: "border-transparent bg-transparent text-green-700 hover:bg-green-500/8 dark:text-green-400",
  yellow: "border-transparent bg-transparent text-yellow-800 hover:bg-yellow-500/8 dark:text-yellow-400",
  amber: "border-transparent bg-transparent text-amber-800 hover:bg-amber-500/8 dark:text-amber-400",
  orange: "border-transparent bg-transparent text-orange-800 hover:bg-orange-500/8 dark:text-orange-400",
  red: "border-transparent bg-transparent text-destructive dark:text-destructive hover:bg-destructive/8",
  gray: "border-transparent bg-transparent text-muted-foreground hover:bg-muted/60",
}

const alertStatusClassMap: Record<"info" | "success" | "warning" | "danger", string> = {
  info: "border border-blue-200 bg-blue-500/10 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200",
  success:
    "border border-green-200 bg-green-500/10 text-green-900 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200",
  warning:
    "border border-amber-200 bg-amber-500/10 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  danger:
    "border border-red-200 bg-destructive/10 text-red-900 dark:border-destructive/30 dark:bg-destructive/10 dark:text-red-200",
}

const alertTitleClassMap: Record<"info" | "success" | "warning" | "danger", string> = {
  info: "text-blue-950 dark:text-blue-100",
  success: "text-green-950 dark:text-green-100",
  warning: "text-amber-950 dark:text-amber-100",
  danger: "text-red-950 dark:text-red-100",
}

export function badgeColorClasses(color: Color, variant: BadgeColorVariant): string {
  if (variant === "link") {
    return ""
  }

  if (variant === "outline") {
    return outlineColorClasses[color]
  }

  if (variant === "ghost") {
    return ghostColorClasses[color]
  }

  if (variant === "secondary") {
    return secondaryColorClasses[color]
  }

  if (variant === "destructive") {
    return ""
  }

  return defaultColorClasses[color]
}

export function alertClasses(status: "info" | "success" | "warning" | "danger"): string {
  return alertStatusClassMap[status]
}

export function alertTitleClasses(status: "info" | "success" | "warning" | "danger"): string {
  return alertTitleClassMap[status]
}
