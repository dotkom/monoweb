"use client"

import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../atoms/Collapsible/Collapsible"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"

interface ReadMoreProps {
  children: ReactNode
  lineClamp?: `line-clamp-${number}`
  readMoreText?: string
  readLessText?: string
  textClassName?: string
  buttonClassName?: string
  outerClassName?: string
}

export const ReadMore = ({
  children,
  lineClamp = "line-clamp-3",
  readMoreText = "Vis mer...",
  readLessText = "Vis mindre",
  textClassName,
  buttonClassName,
  outerClassName,
}: ReadMoreProps) => {
  const [open, setOpen] = useState(false)
  const [isOverflowed, setIsOverflowed] = useState(false)
  const [previousHeight, setPreviousHeight] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: This uses these dependencies indirectly
  useLayoutEffect(() => {
    const element = textRef.current

    if (element) {
      setIsOverflowed(element.scrollHeight > element.clientHeight)
    }
  }, [children, lineClamp])

  const handleToggle = () => {
    if (open && containerRef.current) {
      setPreviousHeight(containerRef.current.getBoundingClientRect().height)
    }

    setOpen(!open)
  }

  const textElement = (
    <Text ref={textRef} className={cn("whitespace-pre-line overflow-hidden", !open && lineClamp, textClassName)}>
      {children}
    </Text>
  )

  if (!isOverflowed) {
    return textElement
  }

  return (
    <Collapsible ref={containerRef} open={open} onOpenChange={setOpen} className={cn(outerClassName)}>
      <CollapsibleContent forceMount>{textElement}</CollapsibleContent>
      <CollapsibleTrigger
        asChild
        onClick={handleToggle}
        className={cn(
          "mt-2 transition-color dark:transition-color text-gray-600 dark:text-stone-300 hover:text-black dark:hover:text-white",
          buttonClassName
        )}
      >
        <Text element="button">{open ? readLessText : readMoreText}</Text>
      </CollapsibleTrigger>
    </Collapsible>
  )
}
