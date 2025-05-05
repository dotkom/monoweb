"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { cn } from "../../utils"
import { Text } from "../Typography/Text"

const getLineClamp = (number: number) => {
  switch (number) {
    case 1:
      return "line-clamp-1"
    case 2:
      return "line-clamp-2"
    case 3:
      return "line-clamp-3"
    case 4:
      return "line-clamp-4"
    case 5:
      return "line-clamp-5"
    case 6:
      return "line-clamp-6"
    case 7:
      return "line-clamp-7"
    case 8:
      return "line-clamp-8"
    case 9:
      return "line-clamp-9"
    case 10:
      return "line-clamp-10"
    case 11:
      return "line-clamp-11"
    case 12:
      return "line-clamp-12"
    default:
      return "line-clamp-3"
  }
}

interface ReadMoreProps {
  text: string
  lines?: number
  readMoreText?: string
  readLessText?: string
  textClassName?: string
  buttonClassName?: string
  outerClassName?: string
}

export const ReadMore = ({
  text,
  lines = 3,
  readMoreText = "Vis mer...",
  readLessText = "Vis mindre",
  textClassName,
  buttonClassName,
  outerClassName,
}: ReadMoreProps) => {
  const [open, setOpen] = useState(false)
  const lineClamp = open ? "line-clamp-none" : getLineClamp(lines)

  const containerRef = useRef<HTMLDivElement>(null)
  const prevHeightRef = useRef<number>(0)

  const handleToggle = () => {
    if (open && containerRef.current) {
      prevHeightRef.current = containerRef.current.getBoundingClientRect().height
    }
    setOpen((o) => !o)
  }

  useLayoutEffect(() => {
    if (open || !prevHeightRef.current || !containerRef.current) {
      return
    }

    const newHeight = containerRef.current.getBoundingClientRect().height
    const delta = prevHeightRef.current - newHeight

    if (delta > 0) {
      window.scrollBy({ top: -delta, behavior: "smooth" })
    }

    prevHeightRef.current = 0
  }, [open])

  return (
    <div ref={containerRef} className={cn(outerClassName)}>
      <Text className={cn("whitespace-pre-line", lineClamp, textClassName)}>{text}</Text>
      <button
        type="button"
        onClick={handleToggle}
        className={cn("mt-2 text-slate-10 hover:underline", buttonClassName)}
      >
        <Text>{open ? readLessText : readMoreText}</Text>
      </button>
    </div>
  )
}
