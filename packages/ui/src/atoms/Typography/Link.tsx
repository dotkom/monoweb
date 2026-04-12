import { type VariantProps, cva } from "cva"
import NextLink from "next/link"
import type { ComponentPropsWithoutRef, PropsWithChildren } from "react"
import { cn } from "../../utils"

export type LinkProps = VariantProps<typeof link> &
  PropsWithChildren &
  ComponentPropsWithoutRef<typeof NextLink> & {
    className?: string
  }

export function Link({ children, className, href, size, ...props }: LinkProps) {
  const classes = cn(link({ size }), className)
  return (
    <NextLink className={classes} {...props} href={href}>
      {children}
    </NextLink>
  )
}

const link = cva("text-black font-body underline", {
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
