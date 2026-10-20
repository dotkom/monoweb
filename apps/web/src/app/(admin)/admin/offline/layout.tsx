import { requireOfflineEditAccess } from "@admin/lib/require-permission"
import type { PropsWithChildren } from "react"

export default async function OfflineLayout({ children }: PropsWithChildren) {
  await requireOfflineEditAccess()

  return children
}
