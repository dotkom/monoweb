import { requireInterestGroupEventAccess } from "@admin/lib/require-permission"
import type { PropsWithChildren } from "react"

export default async function InterestGroupEventsLayout({ children }: PropsWithChildren) {
  await requireInterestGroupEventAccess()

  return children
}
