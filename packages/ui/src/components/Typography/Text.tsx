import { type VariantProps, cva } from "cva"
import type { ComponentPropsWithoutRef, ElementType, PropsWithChildren } from "react"
import { cn } from "../../utils"

export type TextProps<E extends ElementType = "p"> = VariantProps<typeof text> &
  PropsWithChildren & {
    /**
     * The HTML element or React component to render this element as.
     *
     * Defaults to HTML <p> element.
     */
    element?: E
    className?: string
  } & ComponentPropsWithoutRef<E>

export function Text<E extends ElementType = "p">({
  children,
  element,
  className,
  size,
  truncate,
  ...props
}: TextProps<E>) {
  const Component = element ?? "p"
  const classes = cn(text({ size, truncate }), className)
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}

const text = cva("text-slate-12 font-poppins", {
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
