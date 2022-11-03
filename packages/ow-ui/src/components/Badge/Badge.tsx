import { cva } from "cva"
import { FC, PropsWithChildren } from "react"

import { styled } from "../../config/stitches.config"

export interface BadgeProps {
  color: "red" | "green" | "amber" | "blue"
  variant: "subtle" | "filled"
}

export const Badge: FC<PropsWithChildren<BadgeProps>> = ({ children, color, variant }) => {
  return (
    <span className={badge({ color })}>
      {children}
    </span>
  )
}

const badge = cva("px-4 rounded-md font-medium leading-7 flex items-center w-fit", {
  variants: {
    color: {
      red: "bg-red-4 text-red-11",
      blue: "bg-blue-4 text-blue-11",
      green: "bg-green-4 text-green-11",
      amber: "bg-amber-4 text-amber-11",
    },
  },
})
