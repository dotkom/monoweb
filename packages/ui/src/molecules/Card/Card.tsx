import { cva } from "cva"
import type { VariantProps } from "cva"
import type { FC, PropsWithChildren } from "react"
import { cn } from "../../utils"

export type CardProps = PropsWithChildren &
  VariantProps<typeof card> & {
    className?: string
  }

export const Card: FC<CardProps> = (props) => (
  <div className={cn(props.className, card({ shadow: props.shadow, outlined: props.outlined }))}>{props.children}</div>
)

const card = cva("box-border m-0 min-w-0 border p-1 rounded-sm", {
  variants: {
    shadow: {
      true: "shadow-md",
    },
    outlined: {
      true: "border-black",
    },
  },
  defaultVariants: {
    outlined: true,
    shadow: false,
  },
})
