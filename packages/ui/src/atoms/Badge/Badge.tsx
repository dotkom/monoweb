import { Badge as ShadcnBadge, type badgeVariants } from "#components/badge"
import { badgeColorClasses, type Color } from "#lib/colors"
import { cn } from "#lib/utils"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps, PropsWithChildren } from "react"

export type BadgeColor = Color
export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

type BadgeProps = PropsWithChildren<
  ComponentProps<typeof ShadcnBadge> & {
    color?: BadgeColor
  }
>

export function Badge({ variant = "secondary", color, className, children, ...props }: BadgeProps) {
  const resolvedVariant = variant ?? "secondary"

  return (
    <ShadcnBadge
      variant={resolvedVariant}
      className={cn(color && badgeColorClasses(color, resolvedVariant), className)}
      {...props}
    >
      {children}
    </ShadcnBadge>
  )
}

export type { Color as BadgeColorName }
