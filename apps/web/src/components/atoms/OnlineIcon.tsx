import { cn } from "@dotkomonline/ui"
import Image, { type ImageProps } from "next/image"
import type { FC } from "react"

export type OnlineIconProps = Omit<ImageProps, "src" | "alt"> & {
  size?: number
  variant?: "auto" | "dark" | "light"
  inline?: boolean
}

export const OnlineIcon: FC<OnlineIconProps> = ({
  className,
  size = 32,
  variant = "auto",
  inline = false,
  ...props
}) => {
  const lightClassName = cn("object-contain", variant !== "light" && "dark:hidden", inline && "inline-block", className)
  const darkClassName = cn(
    "object-contain",
    variant !== "dark" && (inline ? "hidden dark:inline-block" : "hidden dark:block"),
    className
  )

  const light = (
    <Image
      src="/online-logo-o.svg"
      alt="Logo Online Linjeforening NTNU Trondheim"
      width={size}
      height={size}
      priority
      className={lightClassName}
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
      className={darkClassName}
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
      <span className="contents halloween:hidden">
        {light}
        {dark}
      </span>
      <span className="hidden halloween:contents">
        <Image
          src="/online-logo-o-halloween-light.svg"
          alt="Logo Online Linjeforening NTNU Trondheim Halloween"
          width={size}
          height={size}
          priority
          className={lightClassName}
          {...props}
        />
        <Image
          src="/online-logo-o-halloween.svg"
          alt="Logo Online Linjeforening NTNU Trondheim Halloween Darkmode"
          width={size}
          height={size}
          priority
          className={darkClassName}
          {...props}
        />
      </span>
    </>
  )
}
