import { cn } from "@dotkomonline/ui"
import type { ReactNode } from "react"

interface AttendanceStatusRowProps {
  icon: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export const AttendanceStatusRow = ({ icon, children, className, contentClassName }: AttendanceStatusRowProps) => {
  return (
    <div
      className={cn(
        // The empty last column mirrors the icon column to keep the text centered
        "grid min-w-0 grid-cols-[var(--status-icon-size)_minmax(0,1fr)_var(--status-icon-size)] gap-x-2 [--status-icon-size:--spacing(4.5)]",
        className
      )}
    >
      <span aria-hidden className="flex h-lh items-center justify-center [&>svg]:size-(--status-icon-size)">
        {icon}
      </span>
      <div className={cn("flex min-w-0 flex-col", contentClassName)}>{children}</div>
    </div>
  )
}
