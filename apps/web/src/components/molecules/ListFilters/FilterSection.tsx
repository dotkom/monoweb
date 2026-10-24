import { Label, cn } from "@dotkomonline/ui"
import type { ReactNode } from "react"
import { CountBadge } from "./CountBadge"

interface FilterSectionProps {
  title: string
  count?: number
  children: ReactNode
  className?: string
  headerClassName?: string
}

export const FilterSection = ({ title, count = 0, children, className, headerClassName }: FilterSectionProps) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className={cn("flex items-center gap-2 h-5.5", headerClassName)}>
        <Label className="font-medium text-foreground">{title}</Label>
        <CountBadge count={count} />
      </div>
      {children}
    </div>
  )
}
