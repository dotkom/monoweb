"use client"

import { useEffect, useRef } from "react"

interface Props {
  /**
   * This must come from either a `useState` or callback ref, not a `scrollRef.current` from a `useRef`.
   */
  root?: HTMLElement | null
  /** CSS margin for the observer root, for example `"600px 0px"`. */
  rootMargin?: string
  threshold?: number
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isPlaceholderData: boolean
  isLoading: boolean
}

export const LoadMoreSentinel = ({
  root = null,
  rootMargin = "600px 0px",
  threshold = 0,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isPlaceholderData,
  isLoading,
}: Props) => {
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !isPlaceholderData && !isLoading) {
          fetchNextPage()
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isPlaceholderData, isLoading, root, rootMargin, threshold])

  return <div ref={loaderRef} aria-hidden />
}
