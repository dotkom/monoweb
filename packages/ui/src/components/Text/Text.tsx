import { cva, type VariantProps } from "cva"
import { FC, ReactNode } from "react"
import { cn } from "../../utils"

export interface TextProps extends VariantProps<typeof text> {
  children?: ReactNode
  className?: string
}

export const Text: FC<TextProps> = (props) => {
  return <p className={cn(text({ size: props.size, truncate: props.truncate }), props.className)}>{props.children}</p>
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
