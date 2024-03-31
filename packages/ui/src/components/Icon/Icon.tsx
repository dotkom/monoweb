"use client"

import { Icon as Iconify } from "@iconify-icon/react"
import { forwardRef } from "react"

export type IconProps = React.ComponentPropsWithoutRef<typeof Iconify>

export const Icon = forwardRef<React.ElementRef<typeof Iconify>, IconProps>((props, ref) => (
  <Iconify ref={ref} {...props} />
))

Icon.displayName = "Icon"
