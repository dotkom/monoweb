import { cva, type VariantProps } from "cva"
import { FC, ReactNode } from "react"

export interface TitleProps extends VariantProps<typeof title> {
  children?: ReactNode
  /** The HTML element to use. Defaults to <h2> */
  element?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export const Title: FC<TitleProps> = (props) => {
  const Component = props.element ?? "h2"
  return <Component className={title(props)}>{props.children}</Component>
}

const title = cva("text-slate-12 font-extrabold", {
  variants: {
    size: {
      md: "text-xl",
      lg: "text-2xl",
      xl: "text-4xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
})
