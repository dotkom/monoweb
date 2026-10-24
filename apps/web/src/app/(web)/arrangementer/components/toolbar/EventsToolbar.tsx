import { cn } from "@dotkomonline/ui"
import type { ReactNode, Ref, RefObject } from "react"

interface EventsToolbarProps {
  ref: Ref<HTMLDivElement>
  /** Shows the floating surface */
  isFloating: boolean
  /** Enables transitions */
  isSettled: boolean
  /** Slot for the desktop filter panel, inside the floating surface */
  panelContainerRef?: RefObject<HTMLDivElement | null>
  className?: string
  children: ReactNode
}

/** Sticky toolbar that floats once stuck. Expects the `--events-toolbar-*` variables from the page */
export const EventsToolbar = ({
  ref,
  isFloating,
  isSettled,
  panelContainerRef,
  className,
  children,
}: EventsToolbarProps) => {
  return (
    <div
      ref={ref}
      className={cn(
        "sticky top-(--events-toolbar-top) z-30 mt-1 -mb-3 lg:-mx-3 rounded-3xl py-3",
        isFloating ? "bg-transparent px-3" : "bg-background px-0 lg:px-3",
        panelContainerRef && "md:h-(--events-toolbar-height)",
        isSettled && "transition-[background-color,padding] duration-300 ease-out",
        className
      )}
    >
      {/* Background layer, which also grows behind the open panel */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 -z-10 min-h-full rounded-3xl border border-transparent",
          isSettled && "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
          isFloating &&
            cn(
              "border-gray-200 bg-gray-100/80 shadow-sm backdrop-blur-xl",
              "dark:border-stone-700/30 dark:bg-stone-800/90"
            )
        )}
      >
        {panelContainerRef && (
          // The filter panel renders here, so the background grows to cover it
          <div className="max-md:hidden -m-px">
            {/* Pushes the panel below the controls */}
            <div aria-hidden="true" className="h-(--events-toolbar-height)" />
            {/* Portal target for the filter panel */}
            <div ref={panelContainerRef} />
          </div>
        )}
      </div>

      {children}
    </div>
  )
}
