import { focusManager } from "@tanstack/react-query"
import { useEffect } from "react"

// https://github.com/TanStack/query/issues/2960#issuecomment-971666834
export function useDisableRefetchOnFocus() {
  useEffect(() => {
    focusManager.setFocused(false)
    return () => focusManager.setFocused(undefined)
  }, [])
}
