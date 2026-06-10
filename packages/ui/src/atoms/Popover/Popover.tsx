"use client"

import {
  Popover as ShadcnPopover,
  PopoverContent as ShadcnPopoverContent,
  PopoverTrigger as ShadcnPopoverTrigger,
} from "#components/popover"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react"
import { resolveAsChildRender } from "../../lib/as-child"
import { cn } from "../../utils"

type PopoverAnchorContextValue = {
  anchorElement: Element | null
  setAnchorElement: (element: Element | null) => void
}

const PopoverAnchorContext = createContext<PopoverAnchorContextValue | null>(null)

export function Popover({ children, ...props }: ComponentProps<typeof ShadcnPopover>) {
  const [anchorElement, setAnchorElement] = useState<Element | null>(null)
  const setAnchorElementStable = useCallback((element: Element | null) => {
    setAnchorElement(element)
  }, [])

  const contextValue = useMemo(
    () => ({
      anchorElement,
      setAnchorElement: setAnchorElementStable,
    }),
    [anchorElement, setAnchorElementStable]
  )

  return (
    <PopoverAnchorContext.Provider value={contextValue}>
      <ShadcnPopover {...props}>{children}</ShadcnPopover>
    </PopoverAnchorContext.Provider>
  )
}

type TriggerProps = ComponentProps<typeof ShadcnPopoverTrigger> & {
  asChild?: boolean
}

export function PopoverTrigger({ asChild, children, ...props }: TriggerProps) {
  const resolved = resolveAsChildRender({ asChild, children })

  return (
    <ShadcnPopoverTrigger render={resolved.render} {...props}>
      {resolved.children}
    </ShadcnPopoverTrigger>
  )
}

type AnchorProps = {
  asChild?: boolean
  children?: ReactNode
  className?: string
}

export function PopoverAnchor({ asChild, children, className }: AnchorProps) {
  const context = useContext(PopoverAnchorContext)

  if (!context) {
    throw new Error("PopoverAnchor must be used within Popover")
  }

  const resolved = resolveAsChildRender({ asChild, children })

  if (resolved.render) {
    return cloneElement(resolved.render, {
      ref: (node: Element | null) => {
        context.setAnchorElement(node)
      },
    } as Record<string, unknown>)
  }

  return (
    <div
      ref={(node) => {
        context.setAnchorElement(node)
      }}
      className={className}
    >
      {resolved.children}
    </div>
  )
}

export const PopoverPortal = PopoverPrimitive.Portal

type ContentProps = ComponentProps<typeof ShadcnPopoverContent> & {
  initialFocus?: boolean
}

export function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  initialFocus,
  ...props
}: ContentProps) {
  const context = useContext(PopoverAnchorContext)

  if (context?.anchorElement) {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          anchor={context.anchorElement}
          align={align}
          alignOffset={alignOffset}
          side={side}
          sideOffset={sideOffset}
          className="isolate z-50"
        >
          <PopoverPrimitive.Popup
            data-slot="popover-content"
            initialFocus={initialFocus}
            className={cn(
              "z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              className
            )}
            {...props}
          />
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    )
  }

  return (
    <ShadcnPopoverContent
      className={className}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      initialFocus={initialFocus}
      {...props}
    />
  )
}
