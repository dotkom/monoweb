import React, { forwardRef } from "react"
import { cn } from "../../utils"

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(({ vertical, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "border-gray-200",
        props.className,
        vertical ? "w-2 border-r-1 mr-2" : "w-full border-t-1 h-2 mx-1 self-center"
      )}
      {...props}
    />
  )
})
