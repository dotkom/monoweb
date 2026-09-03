import { cn, TextInput } from "@dotkomonline/ui"
import { IconSearch } from "@tabler/icons-react"
import { forwardRef, type ComponentPropsWithRef } from "react"

export const SearchInput = forwardRef<HTMLInputElement, ComponentPropsWithRef<"input"> & { inputClassName?: string }>(
  ({ className, inputClassName, ...props }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <IconSearch
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
          aria-hidden
        />
        <TextInput
          ref={ref}
          {...props}
          className={cn(
            "pl-10 w-full rounded-lg border border-neutral-200 bg-white text-base shadow-none outline-none transition-colors",
            "hover:border-neutral-300 hover:bg-white",
            "focus-visible:border-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0",
            "dark:border-stone-700 dark:bg-stone-800",
            "dark:hover:border-stone-600 dark:hover:bg-stone-800",
            "dark:focus-visible:border-stone-500",
            inputClassName
          )}
        />
      </div>
    )
  }
)
