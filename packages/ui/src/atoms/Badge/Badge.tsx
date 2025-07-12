"use client"

import { cva } from "cva"
import type { FC, PropsWithChildren } from "react"
import { cn } from "../../utils"

// TODO: Do not abuse CVA like styles does below
export type BadgeProps = {
  color: "amber" | "blue" | "green" | "red" | "slate"
  variant: "light" | "outline" | "solid"
  className?: string
}

export const Badge: FC<PropsWithChildren<BadgeProps>> = ({ children, color, variant, className }) => {
  const style = cn(styles[variant]({ color }), "flex w-fit items-center rounded-md px-4 font-medium", className)
  return <span className={style}>{children}</span>
}

const styles = {
  solid: cva("text-black", {
    variants: {
      color: {
        red: "bg-red-800",
        blue: "bg-blue-800",
        green: "bg-green-800",
        amber: "bg-amber-800 text-slate-50",
        slate: "bg-slate-800",
      },
    },
  }),

  light: cva("", {
    variants: {
      color: {
        red: "bg-red-300 text-red-950",
        blue: "bg-blue-300 text-blue-950",
        green: "bg-green-300 text-green-950",
        amber: "bg-amber-300 text-amber-950",
        slate: "bg-slate-300 text-slate-950",
      },
    },
  }),

  outline: cva("border border-solid", {
    variants: {
      color: {
        red: "border-red-600 text-red-950 bg-red-50",
        blue: "border-blue-600 text-blue-950 bg-blue-50",
        green: "border-green-600 text-green-950 bg-green-50",
        amber: "border-amber-600 text-amber-950 bg-amber-50",
        slate: "border-slate-600 text-slate-950 bg-slate-50",
      },
    },
  }),
}
