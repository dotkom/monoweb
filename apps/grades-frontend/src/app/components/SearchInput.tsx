import { cn, TextInput } from "@dotkomonline/ui"
import { IconSearch } from "@tabler/icons-react"
import { forwardRef, type ComponentPropsWithRef } from "react"

export const SearchInput = forwardRef<HTMLInputElement, ComponentPropsWithRef<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <IconSearch
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
          aria-hidden
        />
        <TextInput
          ref={ref}
          {...props}
          className="pl-10 rounded-lg w-full h-full text-base border border-neutral-200 dark:border-stone-600 dark:bg-stone-800 focus:border-neutral-300 focus:ring-1 ring-neutral-300"
        />
      </div>
    )
  }
)
