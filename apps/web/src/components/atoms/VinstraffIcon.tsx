import { cn } from "@dotkomonline/ui"
import Image from "next/image"
import type { FC } from "react"

type VinstraffIconProps = {
  className?: string
  width?: number
  height?: number
}

export const VinstraffIcon: FC<VinstraffIconProps> = ({ className, width, height }) => {
  const hasExplicitSize = width !== undefined && height !== undefined

  return (
    <span className={cn("inline-flex shrink-0", className)} style={hasExplicitSize ? { width, height } : undefined}>
      <Image
        src="/vengeful-vineyard-icon-black.svg"
        alt="Vinstraff"
        width={width ?? 24}
        height={height ?? 24}
        className="size-full object-contain dark:hidden"
      />
      <Image
        src="/vengeful-vineyard-icon-white.svg"
        alt="Vinstraff"
        width={width ?? 24}
        height={height ?? 24}
        className="hidden size-full object-contain dark:block"
      />
    </span>
  )
}
