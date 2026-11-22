import { requireSidequestAccess } from "@admin/lib/require-permission"
import type { PropsWithChildren } from "react"

export default async function SidequestsLayout({ children }: PropsWithChildren) {
  await requireSidequestAccess()

  return children
}
