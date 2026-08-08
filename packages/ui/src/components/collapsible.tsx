"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { cn } from "../lib/utils"

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ className, ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      className={cn(
        "[&>svg]:transition-transform [&>svg]:duration-200 data-[panel-open]:[&>svg]:rotate-180 motion-reduce:[&>svg]:transition-none",
        className
      )}
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({ className, ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[starting-style]:h-0 data-[ending-style]:h-0 motion-reduce:transition-none",
        className
      )}
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
