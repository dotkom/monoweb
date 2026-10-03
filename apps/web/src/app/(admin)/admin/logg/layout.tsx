import type { PropsWithChildren } from "react"
import { requireAuditLogAccess } from "@dashboard/lib/require-permission"

export default async function AuditLogLayout({ children }: PropsWithChildren) {
  await requireAuditLogAccess()

  return children
}
