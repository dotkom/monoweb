"use client"

import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import * as React from "react"
import { cn } from "#lib/utils"

// Detect touch on mount rather than at render time, to avoid an
// SSR/hydration mismatch.
function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false)
  React.useEffect(() => {
    setIsTouchDevice(typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0))
  }, [])
  return isTouchDevice
}

function HoverCard({ onOpenChange, ...props }: PopoverPrimitive.Root.Props) {
  const isTouchDevice = useIsTouchDevice()

  const handleOpenChange = React.useCallback<NonNullable<PopoverPrimitive.Root.Props["onOpenChange"]>>(
    (open, eventDetails) => {
      // On non-touch devices, hover is the only thing that should open or
      // close the card
      // Touch devices have no hover, so clicks/taps are left alone there.
      if (!isTouchDevice && eventDetails?.reason === "trigger-press") {
        eventDetails.cancel()
        return
      }
      onOpenChange?.(open, eventDetails)
    },
    [isTouchDevice, onOpenChange]
  )

  return <PopoverPrimitive.Root data-slot="hover-card" onOpenChange={handleOpenChange} {...props} />
}

interface HoverCardTriggerProps extends PopoverPrimitive.Trigger.Props {
  /** ms to wait before opening on hover (desktop only, ignored on touch) */
  delay?: number
  /** ms to wait before closing on hover-out (desktop only, ignored on touch) */
  /** (Note: if close delay is short, the card might flash during transition out) */
  closeDelay?: number
}

function HoverCardTrigger({ delay = 75, closeDelay = 150, className, ...props }: HoverCardTriggerProps) {
  const isTouchDevice = useIsTouchDevice()

  return (
    <PopoverPrimitive.Trigger
      data-slot="hover-card-trigger"
      openOnHover={!isTouchDevice}
      delay={delay}
      closeDelay={closeDelay}
      className={cn("cursor-default", className)}
      {...props}
    />
  )
}

function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 4,
  collisionPadding = 8,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "collisionPadding">) {
  return (
    <PopoverPrimitive.Portal data-slot="hover-card-portal">
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "z-50 w-64 origin-(--transform-origin) rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-75 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
