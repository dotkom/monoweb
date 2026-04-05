import { type VariantProps, cva } from "cva"
import type { ElementType, HTMLAttributes, PropsWithChildren, Ref } from "react"
import { cn } from "../../utils"

export type TextProps = VariantProps<typeof text> &
  PropsWithChildren &
  HTMLAttributes<HTMLElement> & {
    element?: ElementType
    className?: string
    ref?: Ref<any>
    htmlFor?: string
    type?: string
    placeholder?: string
    value?: unknown
    name?: string
    required?: boolean
    disabled?: boolean
    checked?: boolean
  }

export function Text({ children, element, className, size, truncate, ref, ...props }: TextProps) {
  const Component = element ?? "p"
  const classes = cn(text({ size, truncate }), className)
  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  )
}

const text = cva("text-inherit font-body", {
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
