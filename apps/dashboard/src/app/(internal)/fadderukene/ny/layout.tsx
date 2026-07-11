import type { PropsWithChildren } from "react"
import { requireFadderukeEditAccess } from "@/lib/require-permission"

export default async function CreateFadderukeLayout({ children }: PropsWithChildren) {
  await requireFadderukeEditAccess()

  return children
}
