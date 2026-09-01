"use client"

import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { IconChevronDown } from "@tabler/icons-react"
import * as React from "react"

import { cn } from "#lib/utils"

function NavigationMenu({
  align = "center",
  className,
  viewportClassName,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align"> & { viewportClassName?: string }) {
  const anchorRef = React.useRef<HTMLDivElement>(null)

  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("relative flex flex-1 items-center justify-center", className)}
      {...props}
    >
      <div ref={anchorRef} className="flex items-center justify-center">
        {children}
      </div>
      <NavigationMenuPositioner anchor={anchorRef} align={align} className={viewportClassName} />
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({ className, ...props }: NavigationMenuPrimitive.List.Props) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props}
    />
  )
}

function NavigationMenuItem({ className, ...props }: NavigationMenuPrimitive.Item.Props) {
  return (
    <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />
  )
}

const navigationMenuTriggerStyle = cn(
  "group inline-flex h-10 w-max items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none",
  "hover:bg-accent/10 data-popup-open:bg-accent/10 disabled:pointer-events-none disabled:opacity-50"
)

function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle, className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon className="relative top-px ml-1 transition-transform duration-300 group-data-popup-open:rotate-180">
        <IconChevronDown className="size-3.5" aria-hidden="true" />
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({ className, ...props }: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "h-full w-auto p-2 transition-[opacity,transform,translate] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        "data-starting-style:data-[activation-direction=left]:-translate-x-1/2 data-starting-style:data-[activation-direction=right]:translate-x-1/2",
        "data-ending-style:data-[activation-direction=left]:translate-x-1/2 data-ending-style:data-[activation-direction=right]:-translate-x-1/2",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 24,
  align = "center",
  alignOffset = 0,
  collisionPadding = 16,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        data-slot="navigation-menu-positioner"
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionAvoidance={{ side: "none" }}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)",
          "transition-[top,left,right,bottom] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none",
          // Invisible bridge over the side-offset gap so hovering from trigger to popup doesn't close the menu
          "before:absolute before:content-['']",
          "data-[side=bottom]:before:inset-x-0 data-[side=bottom]:before:-top-6 data-[side=bottom]:before:h-6"
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup
          data-slot="navigation-menu-popup"
          className={cn(
            "relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-hidden",
            "rounded-xl border border-border/50 bg-popover text-popover-foreground shadow-overlay",
            "transition-[opacity,transform,width,height,scale] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:duration-150 data-ending-style:ease-[ease]",
            className
          )}
        >
          <NavigationMenuPrimitive.Viewport
            data-slot="navigation-menu-viewport"
            className="relative size-full overflow-hidden"
          />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  )
}

function NavigationMenuLink({ className, ...props }: NavigationMenuPrimitive.Link.Props) {
  return <NavigationMenuPrimitive.Link data-slot="navigation-menu-link" className={cn(className)} {...props} />
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
}
