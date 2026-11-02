import { cn } from "@dotkomonline/ui"
import { IconArrowDown } from "@tabler/icons-react"
import { type Ref, useEffect, useImperativeHandle, useRef, useState } from "react"
import styles from "./ScrollHint.module.css"

export interface ScrollHintHandle {
  show: () => void
}

interface ScrollHintProps {
  ref: Ref<ScrollHintHandle>
}

export function ScrollHint({ ref }: ScrollHintProps) {
  const [isVisible, setIsVisible] = useState(true)
  const hintElement = useRef<HTMLDivElement>(null)
  const hideTimeout = useRef<number | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      show() {
        if (hideTimeout.current !== null) {
          window.clearTimeout(hideTimeout.current)
        }

        setIsVisible(true)
        hideTimeout.current = window.setTimeout(() => {
          setIsVisible(false)
          hideTimeout.current = null
        }, 2000)
      },
    }),
    []
  )

  useEffect(() => {
    const hide = () => {
      setIsVisible(false)
    }

    const hideNearPointer = (event: PointerEvent) => {
      const element = hintElement.current

      if (element === null || event.pointerType === "touch") {
        return
      }

      const bounds = element.getBoundingClientRect()
      const proximity = 24
      const isNear =
        event.clientX >= bounds.left - proximity &&
        event.clientX <= bounds.right + proximity &&
        event.clientY >= bounds.top - proximity &&
        event.clientY <= bounds.bottom + proximity

      if (isNear) {
        hide()
      }
    }

    window.addEventListener("scroll", hide, { passive: true })
    window.addEventListener("pointermove", hideNearPointer, { passive: true })

    return () => {
      window.removeEventListener("scroll", hide)
      window.removeEventListener("pointermove", hideNearPointer)

      if (hideTimeout.current !== null) {
        window.clearTimeout(hideTimeout.current)
      }
    }
  }, [])

  return (
    <div
      ref={hintElement}
      id="application-scroll-hint"
      role="status"
      aria-hidden={!isVisible}
      className={cn(
        styles.scrollHint,
        isVisible ? "opacity-100" : "opacity-0",
        "pointer-events-none absolute bottom-full right-1/2 mb-3 flex size-10 translate-x-1/2 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
      )}
    >
      <IconArrowDown className="size-5 shrink-0" aria-hidden="true" />
      <span className="sr-only">Bla ned og se alle gruppene før du går videre.</span>
    </div>
  )
}
