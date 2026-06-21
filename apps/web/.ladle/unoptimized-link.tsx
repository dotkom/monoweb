import type { ComponentPropsWithoutRef } from "react"

export default function UnoptimizedLink(props: ComponentPropsWithoutRef<"a">) {
  return <a {...props} />
}
