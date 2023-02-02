import { cva, VariantProps } from "cva"
import { FC, ReactNode } from "react"

export interface CardProps extends VariantProps<typeof card> {
  children?: ReactNode
}

export const Card: FC<CardProps> = (props) => {
  return (
    <div {...props} className={card(props)}>
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
