export type MenuItemVariant = "default" | "uncolored" | "destructive"

export const menuItemVariantClasses: Record<MenuItemVariant, string> = {
  default:
    "focus:bg-accent/10 focus:text-accent-foreground data-highlighted:bg-accent/10 data-highlighted:text-accent-foreground",
  uncolored: "",
  destructive:
    "text-destructive focus:bg-destructive/8 focus:text-destructive data-highlighted:bg-destructive/8 data-highlighted:text-destructive dark:focus:bg-destructive/12 dark:data-highlighted:bg-destructive/12 *:[svg]:text-destructive",
}

export const menuSubTriggerVariantClasses: Record<MenuItemVariant, string> = {
  default:
    "focus:bg-accent/10 focus:text-accent-foreground data-popup-open:bg-accent/10 data-popup-open:text-accent-foreground data-open:bg-accent/10 data-open:text-accent-foreground data-highlighted:bg-accent/10 data-highlighted:text-accent-foreground",
  uncolored: "",
  destructive:
    "text-destructive focus:bg-destructive/8 focus:text-destructive data-popup-open:bg-destructive/8 data-popup-open:text-destructive data-open:bg-destructive/8 data-open:text-destructive data-highlighted:bg-destructive/8 data-highlighted:text-destructive dark:focus:bg-destructive/12 dark:data-popup-open:bg-destructive/12 dark:data-open:bg-destructive/12 dark:data-highlighted:bg-destructive/12 *:[svg]:text-destructive",
}

export const dropdownMenuContentClass =
  "z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-border/50 bg-popover p-1.5 text-popover-foreground shadow-overlay duration-200 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95"

export const dropdownMenuContentMatchTriggerWidthClass = "w-(--anchor-width)"

export const dropdownMenuContentAutoWidthClass = "w-auto"

export const dropdownMenuSubContentClass =
  "w-auto min-w-[96px] rounded-xl border border-border/50 bg-popover p-1.5 text-popover-foreground shadow-overlay duration-200 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"

export const dropdownMenuLabelClass = "px-2.5 py-1.5 text-xs font-medium text-muted-foreground data-inset:pl-8"

export const dropdownMenuItemClass =
  "group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-hidden select-none data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const dropdownMenuSubTriggerClass =
  "flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-hidden select-none data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const dropdownMenuCheckboxItemClass =
  "relative flex cursor-default items-center gap-2 rounded-lg py-2 pr-8 pl-2.5 text-sm outline-hidden select-none data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

export const dropdownMenuRadioItemClass = dropdownMenuCheckboxItemClass

export const dropdownMenuSeparatorClass = "-mx-1 my-1 h-px bg-border/60"

export const dropdownMenuShortcutClass =
  "ml-auto text-xs tracking-widest text-muted-foreground group-focus/dropdown-menu-item:group-data-[variant=default]/dropdown-menu-item:text-accent-foreground"
