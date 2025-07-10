"use client"

import { cva } from "cva"
import type { FC, PropsWithChildren } from "react"
import { cn } from "../../utils"
import { Text } from "../Typography/Text"

// TODO: Do not abuse CVA like styles does below
export type BadgeProps = {
  color: "amber" | "blue" | "green" | "red" | "slate"
  variant: "light" | "outline" | "solid"
  className?: string
}

export const Badge: FC<PropsWithChildren<BadgeProps>> = ({ children, color, variant, className }) => {
  const style = cn(styles[variant]({ color }), "flex w-fit items-center rounded-md px-2.5 py-0.5 font-medium", className)
  return <Text element="span" className={style}>{children}</Text>
}

const styles = {
  solid: cva("text-sm text-black dark:text-white", {
    variants: {
      color: {
        red: "bg-red-400 text-red-900 dark:bg-red-800",
        blue: "bg-blue-400 text-blue-900 dark:bg-blue-800",
        green: "bg-green-400 text-green-900 dark:bg-green-800",
        amber: "bg-amber-400 text-amber-900 dark:bg-amber-800",
        slate: "bg-slate-400 text-slate-900 dark:bg-stone-700",
      },
    },
  }),

  light: cva("text-sm", {
    variants: {
      color: {
        red: "bg-red-300 text-red-900 dark:bg-red-900 dark:text-red-300",
        blue: "bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-300",
        green: "bg-green-300 text-green-900 dark:bg-green-900 dark:text-green-300",
        amber: "bg-amber-300 text-amber-900 dark:bg-amber-900 dark:text-amber-300",
        slate: "bg-slate-300 text-slate-900 dark:bg-stone-800 dark:text-stone-300",
      },
    },
  }),

  outline: cva("text-sm border", {
    variants: {
      color: {
        red: "border-red-400 text-red-900 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-950",
        blue: "border-blue-400 text-blue-900 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950",
        green: "border-green-400 text-green-900 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-950",
        amber: "border-amber-400 text-amber-900 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950",
        slate: "border-slate-400 text-slate-900 bg-slate-50 dark:border-stone-700 dark:text-stone-300 dark:bg-stone-950",
      },
    },
  }),
}
