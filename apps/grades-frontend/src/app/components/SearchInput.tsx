import { cn, TextInput } from "@dotkomonline/ui"
import { IconSearch } from "@tabler/icons-react"
import { forwardRef, type ComponentPropsWithRef } from "react"

export const SearchInput = forwardRef<HTMLInputElement, ComponentPropsWithRef<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <IconSearch
          className="w-8 h-full pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-neutral-500"
          aria-hidden
        />
        <TextInput
          ref={ref}
          {...props}
          className="pl-10 rounded-lg w-full h-full text-base border border-neutral-200 placeholder:text-neutral-500 focus:border-neutral-300 focus:ring-1 ring-neutral-300"
        />
      </div>
    )
  }
)
