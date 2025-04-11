import { type VariantProps, cva } from "cva"
import type { ComponentPropsWithRef, ElementType, PropsWithChildren } from "react"
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
  } & ComponentPropsWithRef<E>

export function Text<E extends ElementType = "p">({
  children,
  element,
  className,
  size,
  truncate,
  ref,
  ...props
}: TextProps<E>) {
  const Component = element ?? "p"
  const classes = cn(text({ size, truncate }), className)
  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  )
}

const text = cva("text-inherit font-poppins", {
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
