"use client"

import { Text, cn } from "@dotkomonline/ui"
import Spline from "@splinetool/react-spline"
import { IconRotate3d } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import type { FC } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { secondsToMilliseconds } from "date-fns"

const SPLINE_SCENE_URL = "https://prod.spline.design/cuRaxFhP7TxceRfB/scene.splinecode"

// How far the pointer needs to move (in px) before we consider it a "drag"
const DRAG_THRESHOLD_PX = 4

// How long the hint stays visible once shown
const HINT_DURATION_MS = secondsToMilliseconds(3)

// How many plain (non-dragging, non-light-switch) clicks before the hint is displayed
const CLICKS_BEFORE_HINT = 3

interface SplineInstance {
    setVariable?: (name: string, value: boolean | number | string) => void
}

interface PointerInteraction {
    startX: number
    startY: number
    movedPastThreshold: boolean
}

export const OnlineHeroVisual: FC = () => {
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
        // Listening on window in the CAPTURE phase runs before Spline stops
        // propagation, so this works regardless of what the canvas does internally.
        const handleWindowPointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                return
            }
            pointerInteraction.current = {
                startX: event.clientX,
                startY: event.clientY,
                movedPastThreshold: false,
            }
            wasLightSwitchClick.current = false
            setIsTouchInteraction(event.pointerType === "touch")
        }

        const handleWindowPointerMove = (event: PointerEvent) => {
            const interaction = pointerInteraction.current
            if (interaction === null || interaction.movedPastThreshold) return
            const dx = event.clientX - interaction.startX
            const dy = event.clientY - interaction.startY
            if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
                interaction.movedPastThreshold = true
                failedClickCount.current = 0
                clearHintTimeout()
                setShowDragHint(false)
            }
        }

        const handleWindowPointerUp = () => {
            const interaction = pointerInteraction.current
            if (interaction && !interaction.movedPastThreshold && !wasLightSwitchClick.current) {
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
            window.removeEventListener("pointercancel", handleWindowPointerUp, true)
            clearHintTimeout()
        }
    }, [clearHintTimeout])

    const lightSwitch = () => {
        wasLightSwitchClick.current = true
        if (!mounted) return
        const currentTheme = themeState.current
        setTheme(currentTheme === "dark" ? "light" : "dark")
    }

    return (
        <div className="relative w-full">
            <div className="relative inset-0 max-w-[600px] aspect-10/9 mx-auto">
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
                                isLoading ? "opacity-0" : "opacity-100",
                            )}
                        />
                        <div
                            className={cn(
                                "pointer-events-none absolute inset-0 flex top-[75%] items-center justify-center",
                                "transition-opacity duration-300",
                                showDragHint && !isLoading ? "opacity-100" : "opacity-0",
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
    )
}
