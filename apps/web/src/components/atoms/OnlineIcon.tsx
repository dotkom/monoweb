import { cn } from "@dotkomonline/ui"
import Image, { type ImageProps } from "next/image"
import type { FC } from "react"

export type OnlineIconProps = Omit<ImageProps, "src" | "alt"> & {
  size?: number
  variant?: "auto" | "dark" | "light"
}

export const OnlineIcon: FC<OnlineIconProps> = ({ className, size = 32, variant = "auto", ...props }) => {
  const light = (
    <Image
      src="/online-logo-o.svg"
      alt="Logo Online Linjeforening NTNU Trondheim"
      width={size}
      height={size}
      priority
      className={cn("object-contain", variant !== "light" && "dark:hidden", className)}
      {...props}
    />
  )

  const dark = (
    <Image
      src="/online-logo-o-darkmode.svg"
      alt="Logo Online Linjeforening NTNU Trondheim Darkmode"
      width={size}
      height={size}
      priority
      className={cn("object-contain", variant !== "dark" && "hidden dark:block", className)}
      {...props}
    />
  )

  if (variant === "dark") {
    return dark
  }
  if (variant === "light") {
    return light
  }

  return (
    <>
      {light}
      {dark}
    </>
  )
}
