import { cn } from "@dotkomonline/ui"
import type { ReactNode } from "react"

interface AttendanceStatusGroupProps {
  children: ReactNode
  className?: string
}

export const AttendanceStatusGroup = ({ children, className }: AttendanceStatusGroupProps) => {
  return <div className={cn("mx-auto flex w-fit max-w-full flex-col text-left", className)}>{children}</div>
}
