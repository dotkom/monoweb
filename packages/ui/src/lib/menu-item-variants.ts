export type MenuItemVariant = "default" | "uncolored" | "destructive"

export const menuItemVariantClasses: Record<MenuItemVariant, string> = {
  default: "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground",
  uncolored: "",
  destructive:
    "text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20 *:[svg]:text-destructive",
}

export const menuSubTriggerVariantClasses: Record<MenuItemVariant, string> = {
  default:
    "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground",
  uncolored: "",
  destructive:
    "text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20 data-popup-open:bg-destructive/10 data-popup-open:text-destructive data-open:bg-destructive/10 data-open:text-destructive dark:data-popup-open:bg-destructive/20 dark:data-open:bg-destructive/20 *:[svg]:text-destructive",
}
