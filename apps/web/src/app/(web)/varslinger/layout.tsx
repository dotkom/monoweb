import { NotificationsPage } from "@/app/varslinger/NotificationsPage"
import type { PropsWithChildren } from "react"

export default function NotificationsLayout({ children }: PropsWithChildren) {
  return (
    <>
      <NotificationsPage />
      {children}
    </>
  )
}
