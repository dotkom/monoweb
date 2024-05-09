import { useEffect } from "react"
import { focusManager } from "@tanstack/react-query"

// https://github.com/TanStack/query/issues/2960#issuecomment-971666834
export function useDisableRefetchOnFocus() {
    useEffect(() => {
      focusManager.setFocused(false)
      return () => focusManager.setFocused(undefined)
    }, [])

  }