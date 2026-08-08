"use client"

import { Button, Text, cn } from "@dotkomonline/ui"
import { Title } from "@dotkomonline/ui"
import Spline from "@splinetool/react-spline"
import { IconArrowUpRight, IconBriefcase, IconRotate3d } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import type { FC } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Logo } from "./Logo"

const SPLINE_SCENE_URL = "https://prod.spline.design/cuRaxFhP7TxceRfB/scene.splinecode"

interface SplineInstance {
  setVariable?: (name: string, value: boolean | number | string) => void
}

interface PointerInteraction {
  startX: number
  startY: number
  movedPastThreshold: boolean
}

export const OnlineHero: FC = () => {
  const { resolvedTheme, setTheme } = useTheme()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [mounted, setMounted] = useState<boolean>(false)
  const [showDragHint, setShowDragHint] = useState<boolean>(false)
  const [isTouchInteraction, setIsTouchInteraction] = useState<boolean>(false)

  const themeState = useRef<string | undefined>(resolvedTheme)
  const splineRef = useRef<SplineInstance | null>(null)
  const pointerInteraction = useRef<PointerInteraction | null>(null)
  const wasLightSwitchClick = useRef<boolean>(false)
  const failedClickCount = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // How far the pointer needs to move (in px) before we consider it a "drag"
  const DRAG_THRESHOLD = 4
  // How long the hint stays visible once shown
  const HINT_DURATION_MS = 3000
  // How many plain (non-dragging, non-light-switch) clicks before the hint is displayed
  const CLICKS_BEFORE_HINT = 3

  const updateSplineDarkMode = useCallback((darkModeValue: boolean) => {
    if (splineRef.current?.setVariable) {
      splineRef.current.setVariable("darkmode", darkModeValue)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    themeState.current = resolvedTheme

    if (splineRef.current?.setVariable && mounted) {
      updateSplineDarkMode(resolvedTheme === "dark")
    }
  }, [resolvedTheme, mounted, updateSplineDarkMode])

  const onSplineLoad = (spline: SplineInstance) => {
    splineRef.current = spline
    // Initialize Spline with current theme
    if (mounted) {
      updateSplineDarkMode(resolvedTheme === "dark")
    }
    setIsLoading(false)
  }

  const clearHintTimeout = useCallback(() => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current)
      hintTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    // Spline's canvas handles its own pointer/drag logic internally and stops
    // the native event from bubbling, so regular onPointerDown/Move/Up props
    // on a parent element never fire. Listening on window in the CAPTURE
    // phase runs before Spline gets a chance to stop propagation, so this
    // works regardless of what the canvas does internally.
    const handleWindowPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return

      pointerInteraction.current = {
        startX: e.clientX,
        startY: e.clientY,
        movedPastThreshold: false,
      }

      wasLightSwitchClick.current = false
      setIsTouchInteraction(e.pointerType === "touch")

      // Note: an already-visible hint is intentionally left alone here -
      // it should only go away once the user actually drags correctly,
      // not just because they clicked again
    }

    const handleWindowPointerMove = (e: PointerEvent) => {
      const interaction = pointerInteraction.current

      if (!interaction || interaction.movedPastThreshold) return

      const dx = e.clientX - interaction.startX
      const dy = e.clientY - interaction.startY

      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        // They're dragging correctly - they've figured it out, so hide the
        // hint (if visible) and reset the counter in case they need it again
        interaction.movedPastThreshold = true
        failedClickCount.current = 0
        clearHintTimeout()
        setShowDragHint(false)
      }
    }

    const handleWindowPointerUp = () => {
      const interaction = pointerInteraction.current

      if (interaction && !interaction.movedPastThreshold && !wasLightSwitchClick.current) {
        // They pressed and released without dragging, and it wasn't the
        // light switch - count it as a failed click
        failedClickCount.current += 1

        if (failedClickCount.current >= CLICKS_BEFORE_HINT) {
          setShowDragHint(true)
          clearHintTimeout()
          hintTimeoutRef.current = setTimeout(() => setShowDragHint(false), HINT_DURATION_MS)
          failedClickCount.current = 0
        }
      }

      pointerInteraction.current = null
    }

    window.addEventListener("pointerdown", handleWindowPointerDown, true)
    window.addEventListener("pointermove", handleWindowPointerMove, true)
    window.addEventListener("pointerup", handleWindowPointerUp, true)
    window.addEventListener("pointercancel", handleWindowPointerUp, true)

    return () => {
      window.removeEventListener("pointerdown", handleWindowPointerDown, true)
      window.removeEventListener("pointermove", handleWindowPointerMove, true)
      window.removeEventListener("pointerup", handleWindowPointerUp, true)
      window.removeEventListener("pointercancel", handleWindowPointerUp, true)
      clearHintTimeout()
    }
  }, [clearHintTimeout])

  const lightSwitch = () => {
    // Fired by Spline when the light switch is clicked -
    // this is not a failed click, so it should not trigger the hint
    wasLightSwitchClick.current = true

    if (!mounted) return

    const currentTheme = themeState.current
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex flex-col lg:justify-stretch pt-4 md:pt-10 lg:pt-0 gap-4 lg:gap-8 items-center lg:flex-row">
      <div className="flex flex-col gap-8 w-full max-w-[600px] mx-auto lg:mx-0 lg:order-2">
        <span aria-hidden="true" className="w-full max-w-[300px]">
          <Logo />
        </span>
        <Title size="xl" className="font-medium lg:text-3xl">
          Linjeforeningen for informatikk ved NTNU
        </Title>
        <div>
          <div className="flex flex-row gap-2 items-center">
            <IconBriefcase className="size-5" />
            <Text>Er du fra en bedrift og ønsker samarbeid?</Text>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              variant="default"
              size="lg"
              element="a"
              href="/bedrift/interesse"
              iconRight={<IconArrowUpRight className="size-4" />}
            >
              Ta kontakt
            </Button>
            <Button color="gray" size="lg" element={Link} href="/om-linjeforeningen">
              Les mer om oss
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:-ml-8 relative w-full">
        <div className="relative inset-0 max-w-[600px] aspect-10/9 mx-auto lg:mx-0">
          {(!mounted || isLoading) && (
            <div className="absolute inset-0 bg-gray-100 dark:bg-stone-800 rounded-xl animate-pulse w-[80%] h-[80%] m-auto" />
          )}
          {mounted && (
            <div ref={containerRef} className="absolute inset-0 overflow-hidden rounded-[40%]">
              <Spline scene={SPLINE_SCENE_URL} onLoad={onSplineLoad} onSplineMouseDown={lightSwitch} />
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-[39%]",
                  "shadow-[inset_0_0_20px_22px_#fff] transition-opacity duration-700",
                  "dark:shadow-[inset_0_0_20px_22px_#1c1917]",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
              />

              <div
                className={cn(
                  "pointer-events-none absolute inset-0 flex top-[75%] items-center justify-center",
                  "transition-opacity duration-300",
                  showDragHint && !isLoading ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="transform-gpu flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-gray-100 backdrop-blur-sm dark:bg-black/20 dark:text-stone-300">
                  <IconRotate3d className="size-5 shrink-0" />

                  <Text className="text-sm whitespace-nowrap text-inherit">
                    {isTouchInteraction ? "Bruk to fingre for å rotere" : "Klikk og dra for å rotere"}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
