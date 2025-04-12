import { cn } from "@dotkomonline/ui"
import Image, { type ImageProps } from "next/image"
import type { FC } from "react"

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
