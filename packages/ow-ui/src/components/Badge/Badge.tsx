import { cva } from "cva"
import { FC, PropsWithChildren } from "react"
import { twMerge } from "tailwind-merge"

export interface BadgeProps {
  color: "red" | "green" | "amber" | "blue"
  variant: "light" | "solid" | "outline"
}

export const Badge: FC<PropsWithChildren<BadgeProps>> = ({ children, color, variant }) => {
  const style = twMerge(styles[variant]({ color }), "flex w-fit items-center rounded-md px-4 font-medium leading-")
  return <span className={style}>{children}</span>
}
const styles = {
  solid: cva("text-slate-12", {
    variants: {
      color: {
        red: "bg-red-9",
        blue: "bg-blue-9",
        green: "bg-green-9",
        amber: "bg-amber-9 text-slate-1",
      },
    },
  }),

  light: cva("", {
    variants: {
      color: {
        red: "bg-red-4 text-red-11",
        blue: "bg-blue-4 text-blue-11",
        green: "bg-green-4 text-green-11",
        amber: "bg-amber-4 text-amber-11",
      },
    },
  }),

  outline: cva("border border-solid", {
    variants: {
      color: {
        red: "border-red-7 text-red-11 bg-red-1",
        blue: "border-blue-7 text-blue-11 bg-blue-1",
        green: "border-green-7 text-green-11 bg-green-1",
        amber: "border-amber-7 text-amber-11 bg-amber-1",
      },
    },
  }),
}
