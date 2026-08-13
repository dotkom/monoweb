import { requireFeatureManagementAccess } from "@/lib/require-permission"
import type { PropsWithChildren } from "react"

export default async function FeatureLayout({ children }: PropsWithChildren) {
  await requireFeatureManagementAccess()
  return children
}
