"use client"

import {
  DropdownMenu as ShadcnDropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem as ShadcnDropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from "#components/dropdown-menu"
import type { ComponentProps } from "react"
import { resolveAsChildRender } from "../../lib/as-child"

export const DropdownMenu = ShadcnDropdownMenu
export {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
}

type TriggerProps = ComponentProps<typeof ShadcnDropdownMenuTrigger> & {
  asChild?: boolean
}

export function DropdownMenuTrigger({ asChild, children, ...props }: TriggerProps) {
  const resolved = resolveAsChildRender({ asChild, children })

  return (
    <ShadcnDropdownMenuTrigger render={resolved.render} {...props}>
      {resolved.children}
    </ShadcnDropdownMenuTrigger>
  )
}

type ItemProps = ComponentProps<typeof ShadcnDropdownMenuItem> & {
  asChild?: boolean
}

export function DropdownMenuItem({ asChild, children, ...props }: ItemProps) {
  const resolved = resolveAsChildRender({ asChild, children })

  return (
    <ShadcnDropdownMenuItem render={resolved.render} {...props}>
      {resolved.children}
    </ShadcnDropdownMenuItem>
  )
}
