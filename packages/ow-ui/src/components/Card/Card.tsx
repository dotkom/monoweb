import { cva, VariantProps } from "cva"
import { FC, ReactNode } from "react"
import { twMerge } from "tailwind-merge"

export interface CardProps extends VariantProps<typeof card> {
  children?: ReactNode
  className?: string
}

export const Card: FC<CardProps> = (props) => {
  return (
    <div className={twMerge(props.className, card({ shadow: props.shadow, outlined: props.outlined }))}>
      {props.children}
    </div>
  )
}

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
