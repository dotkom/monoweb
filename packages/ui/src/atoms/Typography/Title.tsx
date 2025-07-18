import { type VariantProps, cva } from "cva"
import type { ComponentPropsWithoutRef, ElementType, PropsWithChildren } from "react"
import { cn } from "../../utils"

export type TitleProps<E extends ElementType = "h2"> = VariantProps<typeof title> &
  PropsWithChildren & {
    /**
     * The HTML element or React component to render this element as.
     *
     * Defaults to HTML <h2> element.
     */
    element?: E
    className?: string
  } & ComponentPropsWithoutRef<E>

export function Title<E extends ElementType = "h2">({ children, element, className, size, ...props }: TitleProps<E>) {
  const Component = element ?? "h2"
  const classes = cn(title({ size }), className)
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}

const title = cva("text-inherit font-title font-bold", {
  variants: {
    size: {
      sm: "text-lg font-semibold",
      md: "text-xl font-semibold",
      lg: "text-2xl font-semibold",
      xl: "text-3xl",
    },
  },
  defaultVariants: {
    size: "lg",
  },
})
