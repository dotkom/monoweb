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
  const style = cn(
    styles[variant]({ color }),
    "flex w-fit items-center rounded-sm px-1.5 py-0.5 font-medium",
    className
  )
  return (
    <Text element="div" className={style}>
      {children}
    </Text>
  )
}

const styles = {
  solid: cva("text-sm text-black dark:text-white", {
    variants: {
      color: {
        red: "bg-red-300 text-red-900 dark:bg-red-900 dark:text-red-200",
        blue: "bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-200",
        green: "bg-green-300 text-green-900 dark:bg-green-900 dark:text-green-200",
        amber: "bg-amber-300 text-amber-900 dark:bg-amber-900 dark:text-amber-200",
        slate: "bg-gray-300 text-gray-900 dark:bg-stone-700 dark:text-stone-200",
      },
    },
  }),

  light: cva("text-sm", {
    variants: {
      color: {
        red: "bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-300",
        blue: "bg-blue-200 text-blue-900 dark:bg-blue-950 dark:text-blue-300",
        green: "bg-green-200 text-green-900 dark:bg-green-950 dark:text-green-300",
        amber: "bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
        slate: "bg-gray-200 text-gray-900 dark:bg-stone-800 dark:text-stone-300",
      },
    },
  }),

  outline: cva("text-sm text-black dark:text-white border", {
    variants: {
      color: {
        red: "border-red-400/75 dark:border-red-800",
        blue: "border-blue-400/75 dark:border-blue-800",
        green: "border-green-400/75 dark:border-green-800",
        amber: "border-amber-400/75 dark:border-amber-800",
        slate: "border-gray-500 dark:border-stone-700",
      },
    },
  }),
}
