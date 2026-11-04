import { useSyncExternalStore } from "react"

const QUERY = "(max-width: 768px)"

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener("change", onStoreChange)
  return () => {
    media.removeEventListener("change", onStoreChange)
  }
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}
