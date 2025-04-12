import type { FC } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@dotkomonline/ui"

export type OnlineIconProps = Omit<ImageProps, "src" | "alt"> & {
  size?: number
}

export const OnlineIcon: FC<OnlineIconProps> = ({ className, size = 32, ...props }) => (
  <>
    <Image
      src="/online-logo-o.svg"
      alt="Logo Online Linjeforening NTNU Trondheim"
      width={size}
      height={size}
      priority
      className={cn("object-contain dark:hidden", className)}
      {...props}
    />
    <Image
      src="/online-logo-o-darkmode.svg"
      alt="Logo Online Linjeforening NTNU Trondheim Darkmode"
      width={size}
      height={size}
      priority
      className={cn("object-contain hidden dark:block", className)}
      {...props}
    />
  </>
)
