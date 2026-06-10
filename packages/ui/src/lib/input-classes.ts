import { cva } from "class-variance-authority"

import { fieldControlClass, fieldPrimarySurfaceClass } from "#lib/field-classes"
import { cn } from "#lib/utils"

export const inputVariants = cva(
  cn(
    "h-9 w-full min-w-0 px-3 py-1.5 text-base md:text-sm",
    "placeholder:text-muted-foreground",
    "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    fieldControlClass
  ),
  {
    variants: {
      variant: {
        primary: fieldPrimarySurfaceClass,
        secondary: "bg-transparent shadow-none dark:bg-input/20",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

export const inputGroupVariants = cva(
  cn(
    "group/input-group relative flex h-9 w-full min-w-0 items-center outline-none",
    fieldControlClass,
    "has-disabled:opacity-50",
    "has-[[data-slot=input-group-control]:focus-visible]:border-ring/40 has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/20 has-[[data-slot=input-group-control]:focus-visible]:ring-offset-0",
    "has-[[data-slot][aria-invalid=true]]:border-destructive/50 has-[[data-slot][aria-invalid=true]]:ring-2 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/30",
    "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto",
    "has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5"
  ),
  {
    variants: {
      variant: {
        primary: fieldPrimarySurfaceClass,
        secondary: "bg-transparent shadow-none dark:bg-input/20",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

export const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-2.5 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]",
        "inline-end": "order-last pr-2.5 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]",
        "block-start":
          "order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end": "order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

export const inputGroupButtonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
  variants: {
    size: {
      xs: "h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
      sm: "",
      "icon-xs": "size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>svg]:p-0",
      "icon-sm": "size-8 p-0 has-[>svg]:p-0",
    },
  },
  defaultVariants: {
    size: "xs",
  },
})

export const inputGroupTextClass =
  "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"

export const inputGroupInputClass =
  "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"

export const inputGroupTextareaClass =
  "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 hover:bg-transparent disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:hover:bg-transparent"
