import { cva, type VariantProps } from "cva"
import * as React from "react"
import { cn } from "../../utils"

export interface TextProps extends VariantProps<typeof text> {
  children?: React.ReactNode
  className?: string
}

export const Text: React.FC<TextProps> = (props) => {
  return <p className={cn(props.className, text({ size: props.size, truncate: props.truncate }))}>{props.children}</p>
}

const text = cva("text-slate-12", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-md",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
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
