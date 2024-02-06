import { cva } from "cva"
import { type VariantProps } from "cva"
import * as React from "react"
import { cn } from "../../utils"

export interface CardProps extends VariantProps<typeof card> {
  children?: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = (props) => (
  <div className={cn(props.className, card({ shadow: props.shadow, outlined: props.outlined }))}>{props.children}</div>
)

const card = cva("box-border m-0 min-w-0 border p-1 rounded", {
  variants: {
    shadow: {
      true: "shadow-md",
    },
    outlined: {
      true: "border-slate-12",
    },
  },
  defaultVariants: {
    outlined: true,
    shadow: false,
  },
})
