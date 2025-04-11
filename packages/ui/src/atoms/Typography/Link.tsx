import { type VariantProps, cva } from "cva"
import NextLink from "next/link"
import type { ComponentPropsWithoutRef, ElementType, PropsWithChildren } from "react"
import { cn } from "../../utils"

export type LinkProps<E extends ElementType = typeof NextLink> = VariantProps<typeof link> &
  PropsWithChildren & {
    /**
     * The HTML element or React component to render this element as.
     *
     * Defaults to Next.js Link component.
     */
    element?: E
    className?: string
    href: ComponentPropsWithoutRef<E>["href"]
  } & ComponentPropsWithoutRef<E>

export function Link<E extends ElementType = typeof NextLink>({
  children,
  element,
  className,
  href,
  size,
  ...props
}: LinkProps<E>) {
  const Component = element ?? NextLink
  const classes = cn(link({ size }), className)
  return (
    <Component className={classes} {...props} href={href}>
      {children}
    </Component>
  )
}

const link = cva("text-slate-12 font-poppins underline", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-md",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
})
