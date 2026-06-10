import { fieldControlClass, fieldPrimarySurfaceClass } from "#lib/field-classes"
import { menuItemVariantClasses, type MenuItemVariant } from "#lib/dropdown-menu-classes"
import { cn } from "#lib/utils"

export type { MenuItemVariant }
export { menuItemVariantClasses }

export const selectTriggerClass = cn(
  "flex h-9 w-full min-w-0 items-center justify-between gap-1.5 px-3 py-1.5 text-sm whitespace-nowrap select-none",
  "data-placeholder:text-muted-foreground",
  "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  fieldControlClass,
  fieldPrimarySurfaceClass
)

export const selectContentClass =
  "relative isolate z-50 max-h-(--available-height) min-w-[max(9rem,var(--anchor-width))] w-max origin-(--transform-origin) overflow-y-auto rounded-field border border-field-border bg-popover text-popover-foreground shadow-popover duration-200 data-[align-trigger=true]:w-(--anchor-width) data-[align-trigger=true]:min-w-(--anchor-width) data-[align-trigger=true]:max-w-(--anchor-width) data-[align-trigger=true]:overflow-x-hidden data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"

export const selectLabelClass = "px-1.5 py-1 text-xs text-muted-foreground"

export const selectItemClass =
  "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2"

export const selectSeparatorClass = "pointer-events-none -mx-1 my-1 h-px bg-border/60"

export const selectScrollButtonClass =
  "z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4"
