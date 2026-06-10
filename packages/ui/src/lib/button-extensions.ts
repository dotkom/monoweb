import type { VariantProps } from "class-variance-authority"
import type { buttonVariants } from "#components/button"
import { cn } from "#lib/utils"

export const PROJECT_BUTTON_VARIANTS = ["unstyled"] as const

export type ProjectButtonVariant = (typeof PROJECT_BUTTON_VARIANTS)[number]

export type ShadcnButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>

export type ButtonVariant = ShadcnButtonVariant | ProjectButtonVariant

export const BUTTON_COLORS = ["brand", "brand-accent", "blue", "red", "dark", "gray"] as const

export type ButtonColor = (typeof BUTTON_COLORS)[number]

export const DEFAULT_BUTTON_COLOR: ButtonColor = "brand"

export function isProjectButtonVariant(variant: ButtonVariant): variant is ProjectButtonVariant {
  return variant === "unstyled"
}

export const buttonVariantExtensions: Record<ProjectButtonVariant, string> = {
  unstyled: cn(
    "border-0 p-0 text-inherit active:not-aria-[haspopup]:translate-y-0",
    "h-auto min-h-0 gap-0 rounded-none bg-transparent font-[inherit] text-[length:inherit] shadow-none",
    "hover:bg-transparent focus-visible:ring-0 disabled:opacity-100"
  ),
}

export const buttonVariantOverrides: Partial<Record<ShadcnButtonVariant, string>> = {
  default: "[a]:hover:bg-brand/85 shadow-surface",
  secondary:
    "hover:bg-foreground/8 dark:hover:bg-foreground/10 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
  link: "text-inherit underline-offset-3 hover:underline",
}

const solid: Record<ButtonColor, string> = {
  brand:
    "border-0 bg-brand text-white shadow-surface hover:bg-brand/85 [a]:hover:bg-brand/85 aria-expanded:bg-brand aria-expanded:text-white",
  "brand-accent":
    "border-0 bg-brand-accent text-black shadow-surface hover:bg-brand-accent/85 [a]:hover:bg-brand-accent/85 aria-expanded:bg-brand-accent aria-expanded:text-black",
  blue: "border-0 bg-blue-600 text-white shadow-surface hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
  red: "border-0 bg-red-600 text-white shadow-surface hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
  dark: "border-0 bg-foreground dark:bg-foreground text-background shadow-surface hover:bg-foreground/10 hover:text-foreground dark:hover:text-foreground [a]:hover:bg-foreground/10 dark:hover:bg-foreground/15 dark:[a]:hover:bg-foreground/15",
  gray: "border-0 bg-foreground/10 text-foreground shadow-none hover:bg-foreground/15 dark:bg-foreground/15 dark:hover:bg-foreground/22 aria-expanded:bg-foreground/15 aria-expanded:text-foreground",
}

const secondary: Record<ButtonColor, string> = {
  brand: "bg-brand/8 text-brand hover:bg-brand/14 dark:bg-brand/10 dark:hover:bg-brand/16",
  "brand-accent":
    "bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/18 dark:bg-brand-accent/10 dark:hover:bg-brand-accent/16",
  blue: "bg-blue-500/8 text-blue-700 hover:bg-blue-500/14 dark:text-blue-400 dark:hover:bg-blue-500/18",
  red: "bg-red-500/8 text-red-700 hover:bg-red-500/14 dark:text-red-400 dark:hover:bg-red-500/18",
  dark: "bg-foreground/10 text-foreground hover:bg-foreground hover:text-background dark:bg-foreground/12 dark:hover:bg-foreground dark:hover:text-background",
  gray: "bg-gray-500/8 text-foreground hover:bg-gray-500/14 dark:bg-stone-600/12 dark:hover:bg-stone-600/18",
}

const outline: Record<ButtonColor, string> = {
  brand: "border-brand/30 text-brand hover:bg-brand/8",
  "brand-accent": "border-brand-accent/35 text-foreground dark:text-brand-accent hover:bg-brand-accent/10",
  blue: "border-blue-600/25 text-blue-700 hover:bg-blue-500/8 dark:text-blue-400",
  red: "border-destructive/25 text-destructive hover:bg-destructive/8",
  dark: "border-foreground/15 hover:bg-foreground dark:hover:bg-foreground hover:text-background dark:hover:text-background",
  gray: "border-border/50 text-foreground hover:bg-muted/60 hover:text-foreground",
}

const ghost: Record<ButtonColor, string> = {
  brand: "text-brand hover:text-brand dark:text-brand hover:bg-brand/8 dark:hover:text-brand dark:hover:bg-brand/16",
  "brand-accent":
    "text-brand-accent hover:text-brand-accent dark:text-brand-accent dark:hover:text-brand-accent hover:bg-brand-accent/10 dark:hover:bg-brand-accent/16",
  blue: "text-blue-700 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-400 hover:bg-blue-500/8 dark:hover:bg-blue-500/12",
  red: "text-red-700 hover:text-red-700 dark:text-red-400 dark:hover:text-red-400 hover:bg-red-500/8 dark:hover:bg-red-500/12",
  dark: "hover:bg-foreground hover:text-background dark:hover:bg-foreground dark:hover:text-background",
  gray: "text-foreground hover:bg-muted/70 hover:text-foreground dark:hover:text-foreground dark:hover:bg-muted/80",
}

export function resolveShadcnButtonVariant(variant: ButtonVariant): ShadcnButtonVariant | null {
  if (isProjectButtonVariant(variant)) {
    return null
  }

  return variant
}

export function resolveButtonColor(variant: ButtonVariant, color?: ButtonColor): ButtonColor | undefined {
  if (color) {
    return color
  }

  if (variant === "default") {
    return DEFAULT_BUTTON_COLOR
  }

  return undefined
}

export function buttonColorClasses(color: ButtonColor, variant: ButtonVariant): string {
  if (variant === "unstyled" || variant === "destructive" || variant === "link") {
    return ""
  }

  if (variant === "default") {
    return solid[color]
  }

  if (variant === "secondary") {
    return secondary[color]
  }

  if (variant === "outline") {
    return outline[color]
  }

  if (variant === "ghost") {
    return ghost[color]
  }

  return ""
}
