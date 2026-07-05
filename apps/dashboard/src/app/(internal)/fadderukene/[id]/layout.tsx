import type { PropsWithChildren } from "react"
import { requireFadderukeEditAccess } from "@/lib/require-permission"

export default async function EditFadderukeLayout({ children }: PropsWithChildren) {
  await requireFadderukeEditAccess()

  return children
}
