"use client"

import DOMPurify from "isomorphic-dompurify"
import { useLayoutEffect, useRef, useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../atoms/Collapsible/Collapsible"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"

interface RichTextProps {
  content: string
  colorLinks?: boolean
  className?: string
  lineClamp?: `line-clamp-${number}`
  readMoreText?: string
  readLessText?: string
  hideToggleButton?: boolean
  toggleButtonClassName?: string
}

export function RichText({
  content,
  className,
  colorLinks = false,
  lineClamp = "line-clamp-3",
  readMoreText = "Vis mer...",
  readLessText = "Vis mindre",
  hideToggleButton = false,
  toggleButtonClassName,
}: RichTextProps) {
  const [open, setOpen] = useState(false)
  const [isOverflowed, setIsOverflowed] = useState(false)
  const [previousHeight, setPreviousHeight] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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
    const element = contentRef.current

    if (element) {
      setIsOverflowed(element.scrollHeight > element.clientHeight)
    }
  }, [content, lineClamp])

  const handleToggle = () => {
    if (open && containerRef.current) {
      setPreviousHeight(containerRef.current.getBoundingClientRect().height)
    }

    setOpen(!open)
  }

  const richText = (
    <Text
      element="div"
      ref={contentRef}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      className={cn(
        "prose dark:prose-invert whitespace-pre-line overflow-hidden", // base
        !open && lineClamp, // clamp when closed
        "[&_a]:underline",
        "dark:text-white",
        colorLinks && "[&_a]:text-blue-700 dark:[&_a]:text-blue-300",
        "[&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1",
        "[&_code]:px-1 [&_code]:py-0.5 [&_code]:bg-black/10 [&_code]:dark:bg-white/10 [&_code]:rounded-md",
        className
      )}
    />
  )

  if (!isOverflowed || hideToggleButton) return richText

  return (
    <Collapsible ref={containerRef} open={open} onOpenChange={setOpen}>
      <CollapsibleContent forceMount>{richText}</CollapsibleContent>
      <CollapsibleTrigger
        asChild
        onClick={handleToggle}
        className={cn(
          "mt-2 transition-colors text-gray-500 dark:text-stone-500 hover:text-black dark:hover:text-white [font-size:inherit]",
          toggleButtonClassName
        )}
      >
        <Text element="button">{open ? readLessText : readMoreText}</Text>
      </CollapsibleTrigger>
    </Collapsible>
  )
}
