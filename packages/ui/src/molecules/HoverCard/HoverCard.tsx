"use client"

import {
  type ExtendedRefs,
  FloatingPortal,
  type Placement,
  flip,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react"
import React from "react"
import { cn } from "../../utils"

interface HoverCardProps {
  /** Placement of the floating card */
  placement?: Placement
  /** Offset from the trigger element */
  offsetDistance?: number
  /** Children using the compound component pattern */
  children: React.ReactNode
}

interface HoverCardTriggerProps {
  children: React.ReactNode
  className?: string
}

interface HoverCardContentProps {
  children: React.ReactNode
  className?: string
}

const HoverCardContext = React.createContext<{
  open: boolean
  refs: ExtendedRefs<Element>
  floatingStyles: React.CSSProperties
  getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>
  getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>
} | null>(null)

export const HoverCard = ({ placement = "bottom", offsetDistance = 2, children }: HoverCardProps) => {
  const [open, setOpen] = React.useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(offsetDistance), flip({ padding: 8 }), shift({ padding: 8 })],
  })

  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window

  const hover = useHover(context, {
    enabled: !isTouchDevice,
    move: false,
    handleClose: safePolygon(),
  })
  const click = useClick(context, { enabled: isTouchDevice })
  const dismiss = useDismiss(context)
  const role = useRole(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss, role])

  return (
    <HoverCardContext.Provider value={{ open, refs, floatingStyles, getReferenceProps, getFloatingProps }}>
      {children}
    </HoverCardContext.Provider>
  )
}

const useHoverCardContext = () => {
  const context = React.useContext(HoverCardContext)
  if (!context) {
    throw new Error("HoverCard components must be used within HoverCard")
  }
  return context
}

export const HoverCardTrigger = ({ children, className }: HoverCardTriggerProps) => {
  const { refs, getReferenceProps } = useHoverCardContext()

  return (
    <div ref={refs.setReference} {...getReferenceProps()} className={className}>
      {children}
    </div>
  )
}

export const HoverCardContent = ({ children, className }: HoverCardContentProps) => {
  const { open, refs, floatingStyles, getFloatingProps } = useHoverCardContext()

  if (!open) return null

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
        className={cn("rounded-lg min-w-64 z-50", className)}
      >
        {children}
      </div>
    </FloatingPortal>
  )
}
