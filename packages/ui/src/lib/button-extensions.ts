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
  default: "[a]:hover:bg-brand/80",
  secondary:
    "hover:bg-foreground/12 dark:hover:bg-foreground/12 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
  link: "text-inherit underline-offset-3 hover:underline",
}

const solid: Record<ButtonColor, string> = {
  brand: "bg-brand text-white hover:bg-brand/70 [a]:hover:bg-brand/70 aria-expanded:bg-brand aria-expanded:text-white",
  "brand-accent":
    "bg-brand-accent text-black hover:bg-brand-accent/70 [a]:hover:bg-brand-accent/70 aria-expanded:bg-brand-accent aria-expanded:text-black",
  blue: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
  red: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
  dark: "bg-foreground text-background hover:bg-foreground/72 [a]:hover:bg-foreground/72",
  gray: "bg-foreground/10 text-foreground hover:bg-foreground/15 dark:bg-foreground/15 dark:hover:bg-foreground/22 aria-expanded:bg-foreground/15 aria-expanded:text-foreground",
}

const secondary: Record<ButtonColor, string> = {
  brand: "bg-brand/10 text-brand hover:bg-brand/18 dark:bg-brand/8 dark:hover:bg-brand/18",
  "brand-accent":
    "bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 dark:bg-brand-accent/8 dark:hover:bg-brand-accent/15",
  blue: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/25",
  red: "bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/25",
  dark: "bg-foreground/25 text-foreground hover:bg-foreground hover:text-background dark:bg-foreground/18 dark:hover:bg-foreground dark:hover:text-background",
  gray: "bg-gray-500/10 text-foreground hover:bg-gray-500/20 dark:bg-stone-600/18 dark:hover:bg-stone-600/28",
}

const outline: Record<ButtonColor, string> = {
  brand: "border-brand/30 text-brand hover:bg-brand/10",
  "brand-accent": "border-brand-accent/40 text-foreground hover:bg-brand-accent/15",
  blue: "border-blue-600/30 text-blue-700 hover:bg-blue-500/10 dark:text-blue-400",
  red: "border-destructive/30 text-destructive hover:bg-destructive/10",
  dark: "border-foreground/20 hover:bg-foreground hover:text-background",
  gray: "border-border text-foreground hover:bg-muted hover:text-foreground",
}

const ghost: Record<ButtonColor, string> = {
  brand: "text-brand dark:text-brand hover:bg-brand/10",
  "brand-accent": "text-brand-accent dark:text-brand-accent hover:bg-brand-accent/15",
  blue: "text-blue-700 hover:bg-blue-500/10 dark:text-blue-400",
  red: "text-red-700 hover:bg-red-500/10 dark:text-red-400",
  dark: "hover:bg-muted hover:text-foreground",
  gray: "text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
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
