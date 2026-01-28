import NextLink from "next/link"
import type { ComponentPropsWithRef, ElementType, PropsWithChildren } from "react"
import { cn } from "../../utils"
import { cva, type VariantProps } from "cva"

export type TextLinkProps<E extends ElementType = typeof NextLink> = VariantProps<typeof textLink> & PropsWithChildren & {
  /**
   * The HTML element or React component to render this element as.
   *
   * Defaults to Next.js Link component.
   */
  element?: E
  className?: string
  href: ComponentPropsWithRef<E>["href"]
} & ComponentPropsWithRef<E>

export function TextLink<E extends ElementType = typeof NextLink>({
  children,
  element,
  className,
  href,
  ref,
  size,
  truncate,
  ...props
}: TextLinkProps<E>) {
  const Component = element ?? NextLink
  const classes = cn(textLink({ size, truncate }), className)
  return (
    <Component href={href} ref={ref} className={classes} {...props}>
      {children}
    </Component>
  )
}

export const textLink = cva("text-inherit font-body underline decoration-gray-950/50 hover:decoration-gray-950 dark:decoration-white/50 dark:hover:decoration-white", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-md",
      lg: "text-lg",
    },
    truncate: {
      true: "truncate",
    },
  },
  defaultVariants: {
    size: "md",
    truncate: false,
  },
})
