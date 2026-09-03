"use client"

import { IconActionButton } from "@/app/[locale]/components/action-button/ActionButton"
import { cn } from "@dotkomonline/ui"
import { IconArrowUp } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useLayoutEffect, useState } from "react"

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const t = useTranslations("ScrollToTop")

  useLayoutEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (ticking) {
        return
      }

      ticking = true

      requestAnimationFrame(() => {
        setIsVisible(window.scrollY >= window.innerHeight)
        ticking = false
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <IconActionButton
      className={cn(
        "fixed bottom-6 z-50 right-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:right-[max(3rem,calc((100vw-80rem)/2+3rem))]",
        "border shadow-sm",
        "bg-white border-neutral-300 hover:border-neutral-400 hover:bg-white",
        "dark:bg-stone-800 dark:border-stone-600 dark:hover:bg-stone-800 dark:hover:border-stone-500",
        "transition motion-safe:duration-200",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}
      onClick={() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "instant" : "smooth" })
      }}
      aria-label={t("ariaLabel")}
    >
      <IconArrowUp className="size-4" />
    </IconActionButton>
  )
}
