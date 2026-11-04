"use client"

import { DropdownMenuContent } from "@dotkomonline/ui"
import { type ComponentProps, createContext, type FC, type RefObject, useContext } from "react"

/** The part of the navbar the dropdowns are positioned against, instead of their own trigger */
export const NavbarDropdownAnchorContext = createContext<RefObject<HTMLElement | null> | undefined>(undefined)

/** Dropdown content that opens below the navbar, aligned with its right edge */
export const NavbarDropdownContent: FC<ComponentProps<typeof DropdownMenuContent>> = (props) => {
  const anchor = useContext(NavbarDropdownAnchorContext)

  return (
    <DropdownMenuContent
      align="end"
      anchor={anchor}
      sideOffset={11}
      collisionPadding={16}
      positionMethod="fixed"
      {...props}
    />
  )
}
