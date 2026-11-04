import type { PropsWithChildren } from "react"
import { requireAuditLogAccess } from "@admin/lib/require-permission"

export default async function AuditLogLayout({ children }: PropsWithChildren) {
  await requireAuditLogAccess()

  return children
}
