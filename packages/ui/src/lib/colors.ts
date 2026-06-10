import type { badgeVariants } from "#components/badge"
import type { VariantProps } from "class-variance-authority"

export const COLORS = ["brand", "brand-accent", "blue", "green", "yellow", "amber", "red", "gray"] as const

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
  red: "border-transparent bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  gray: "border-transparent bg-gray-500/10 text-gray-700 dark:bg-stone-500/15 dark:text-stone-300",
}

const secondaryColorClasses: Record<Color, string> = {
  brand: "border-brand/20 bg-brand/6 text-brand dark:bg-brand/8 dark:text-brand",
  "brand-accent": "border-brand-accent/25 bg-brand-accent/8 text-brand-accent dark:bg-brand-accent/10",
  blue: "border-blue-500/20 bg-blue-500/6 text-blue-700 dark:bg-blue-500/8 dark:text-blue-400",
  green: "border-green-500/20 bg-green-500/6 text-green-700 dark:bg-green-500/8 dark:text-green-400",
  yellow: "border-yellow-500/20 bg-yellow-500/6 text-yellow-800 dark:bg-yellow-500/8 dark:text-yellow-400",
  amber: "border-amber-500/20 bg-amber-500/6 text-amber-800 dark:bg-amber-500/8 dark:text-amber-400",
  red: "border-red-500/20 bg-red-500/6 text-red-700 dark:bg-red-500/8 dark:text-red-400",
  gray: "border-border/50 bg-gray-500/6 text-gray-700 dark:bg-stone-500/8 dark:text-stone-400",
}

const outlineColorClasses: Record<Color, string> = {
  brand: "border-brand/25 bg-transparent text-brand",
  "brand-accent": "border-brand-accent/30 bg-transparent text-brand-accent",
  blue: "border-blue-600/25 bg-transparent text-blue-700 dark:text-blue-400",
  green: "border-green-600/25 bg-transparent text-green-700 dark:text-green-400",
  yellow: "border-yellow-600/25 bg-transparent text-yellow-800 dark:text-yellow-400",
  amber: "border-amber-600/25 bg-transparent text-amber-800 dark:text-amber-400",
  red: "border-destructive/25 bg-transparent text-destructive",
  gray: "border-border/60 bg-transparent text-muted-foreground",
}

const ghostColorClasses: Record<Color, string> = {
  brand: "border-transparent bg-transparent text-brand dark:text-brand hover:bg-brand/8",
  "brand-accent": "border-transparent bg-transparent text-brand-accent dark:text-brand-accent hover:bg-brand-accent/10",
  blue: "border-transparent bg-transparent text-blue-700 hover:bg-blue-500/8 dark:text-blue-400",
  green: "border-transparent bg-transparent text-green-700 hover:bg-green-500/8 dark:text-green-400",
  yellow: "border-transparent bg-transparent text-yellow-800 hover:bg-yellow-500/8 dark:text-yellow-400",
  amber: "border-transparent bg-transparent text-amber-800 hover:bg-amber-500/8 dark:text-amber-400",
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
