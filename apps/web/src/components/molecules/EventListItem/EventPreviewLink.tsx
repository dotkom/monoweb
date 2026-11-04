"use client"

import type { Event } from "@dotkomonline/rpc/event"
import Link from "next/link"
import { type ComponentProps, createContext, useContext } from "react"

// This component is used to open the event preview drawer when clicking on an event link on desktop, and to navigate to
// the event page on mobile.

export type PreviewEvent = Pick<Event, "id" | "title">

// The list page supplies its drawer opener. Outside that page, null keeps event links behaving normally.
export const EventPreviewContext = createContext<((event: PreviewEvent, trigger: HTMLAnchorElement) => void) | null>(
  null
)

export function EventPreviewLink({ event, onClick, ...props }: ComponentProps<typeof Link> & { event: PreviewEvent }) {
  const openPreview = useContext(EventPreviewContext)

  return (
    <Link
      prefetch={false}
      {...props}
      onClick={(click) => {
        // We run the caller's click handler first so they can cancel the click before we decide to open the drawer.
        onClick?.(click)

        // We only open the drawer for ordinary clicks on desktop when a drawer is available. Mobile users should still
        // navigate to the event page, and links outside the event list page should behave as before. We also leave
        // modified clicks, other mouse buttons, and explicit targets alone. For example, Ctrl/Cmd-click should still
        // open the event in a new tab rather than opening the drawer in the current one.
        if (
          click.defaultPrevented === true ||
          openPreview === null ||
          window.matchMedia("(min-width: 768px)").matches === false ||
          click.button !== 0 ||
          click.metaKey ||
          click.ctrlKey ||
          click.shiftKey ||
          click.altKey ||
          (props.target !== undefined && props.target !== "_self")
        ) {
          return
        }

        // Stop Next.js from following the link when we open the drawer. Keeping the href on the link still allows users
        // to copy its address and use the browser's normal link actions.
        click.preventDefault()

        // We pass the clicked anchor as well as the event so the drawer can restore keyboard focus to the link when it
        // closes. This lets the user continue through the event list from where they left off.
        openPreview({ id: event.id, title: event.title }, click.currentTarget)
      }}
    />
  )
}
