"use client"

import {
  Collapsible as ShadcnCollapsible,
  CollapsibleContent as ShadcnCollapsibleContent,
  CollapsibleTrigger as ShadcnCollapsibleTrigger,
} from "#components/collapsible"
import type { ComponentProps } from "react"
import { resolveAsChildRender } from "../../lib/as-child"

export const Collapsible = ShadcnCollapsible

type TriggerProps = ComponentProps<typeof ShadcnCollapsibleTrigger> & {
  asChild?: boolean
}

export function CollapsibleTrigger({ asChild, children, ...props }: TriggerProps) {
  const resolved = resolveAsChildRender({ asChild, children })

  return (
    <ShadcnCollapsibleTrigger render={resolved.render} {...props}>
      {resolved.children}
    </ShadcnCollapsibleTrigger>
  )
}

type ContentProps = ComponentProps<typeof ShadcnCollapsibleContent> & {
  forceMount?: boolean
}

export function CollapsibleContent({ forceMount, ...props }: ContentProps) {
  return <ShadcnCollapsibleContent keepMounted={forceMount} {...props} />
}
