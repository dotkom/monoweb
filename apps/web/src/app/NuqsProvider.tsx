import type { PropsWithChildren } from "react"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export const NuqsProvider = ({ children }: PropsWithChildren) => {
  return <NuqsAdapter>{children}</NuqsAdapter>
}
