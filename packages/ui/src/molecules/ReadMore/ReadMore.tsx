"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../atoms/Collapsible/Collapsible"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"

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

  const [previousHeight, setPreviousHeight] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const lineClamp = !open && getLineClamp(lines)

  useLayoutEffect(() => {
    if (open || previousHeight === null || !containerRef.current) {
      return
    }

    const newHeight = containerRef.current.getBoundingClientRect().height
    const delta = previousHeight - newHeight

    if (delta > 0) {
      window.scrollBy({ top: -delta })
    }

    setPreviousHeight(0)
  }, [open, previousHeight])

  const handleToggle = () => {
    if (open && containerRef.current) {
      setPreviousHeight(containerRef.current.getBoundingClientRect().height)
    }

    setOpen(!open)
  }

  return (
    <Collapsible ref={containerRef} open={open} onOpenChange={setOpen} className={cn(outerClassName)}>
      <CollapsibleContent forceMount>
        <Text className={cn("mb-2 whitespace-pre-line overflow-hidden", lineClamp, textClassName)}>{text}</Text>
      </CollapsibleContent>
      <CollapsibleTrigger
        asChild
        onClick={handleToggle}
        className={cn("cursor-pointer text-slate-10 hover:text-slate-12", buttonClassName)}
      >
        <Text>{open ? readLessText : readMoreText}</Text>
      </CollapsibleTrigger>
    </Collapsible>
  )
}
