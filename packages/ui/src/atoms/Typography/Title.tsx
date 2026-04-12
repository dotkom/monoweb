import { type VariantProps, cva } from "cva"
import type { HTMLAttributes, PropsWithChildren } from "react"
import { cn } from "../../utils"

type TitleElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p"

export type TitleProps = VariantProps<typeof title> &
  PropsWithChildren &
  HTMLAttributes<HTMLHeadingElement> & {
    element?: TitleElement
    className?: string
  }

export function Title({ children, element, className, size, ...props }: TitleProps) {
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
