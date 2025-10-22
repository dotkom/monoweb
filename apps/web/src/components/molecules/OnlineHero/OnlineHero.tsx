"use client"

import { Button, Icon, Text, cn } from "@dotkomonline/ui"
import { Title } from "@dotkomonline/ui"
import Spline from "@splinetool/react-spline"
import { useTheme } from "next-themes"
import type { FC } from "react"
import { useEffect, useRef, useState } from "react"
import { Logo } from "./Logo"

interface SplineInstance {
  setVariable?: (name: string, value: boolean | number | string) => void
  getVariable?: (name: string) => boolean | number | string
}

export const OnlineHero: FC = () => {
  const { resolvedTheme, setTheme } = useTheme()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [mounted, setMounted] = useState<boolean>(false)

  // easter egg
  const [switchCount, setSwitchCount] = useState<number>(0)
  const [showBlackScreen, setShowBlackScreen] = useState<boolean>(false)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [cooldown, setCooldown] = useState<boolean>(false)

  const themeState = useRef<string | undefined>(resolvedTheme)
  const splineRef = useRef<SplineInstance | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    themeState.current = resolvedTheme

    if (splineRef.current?.setVariable && mounted) {
      updateSplineDarkMode(resolvedTheme === "dark")
    }
  }, [resolvedTheme, mounted])

  useEffect(() => {
    let frame: number

    const handleMove = (x: number, y: number) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        // only update once per frame
        setMousePosition({ x, y })
      })
    }

    const handleMouseMove = (event: MouseEvent) => handleMove(event.clientX, event.clientY)

    const handleTouch = (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0]
      if (touch) handleMove(touch.clientX, touch.clientY)
    }

    // Add listeners for both mouse and touch
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchstart", handleTouch)
    window.addEventListener("touchmove", handleTouch)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchstart", handleTouch)
      window.removeEventListener("touchmove", handleTouch)
    }
  }, [])

  const onSplineLoad = (spline: SplineInstance) => {
    splineRef.current = spline
    // Initialize Spline with current theme
    if (mounted) {
      updateSplineDarkMode(resolvedTheme === "dark")
    }
    setIsLoading(false)
  }

  const updateSplineDarkMode = (darkModeValue: boolean) => {
    if (splineRef.current?.setVariable) {
      splineRef.current.setVariable("darkmode", darkModeValue)
    }
  }

  const lightSwitch = () => {
    if (!mounted) return

    const currentTheme = themeState.current
    setTheme(currentTheme === "dark" ? "light" : "dark")

    setSwitchCount((prev) => {
      const newCount = prev + 1

      setShowBlackScreen((prev) => {
        if (newCount > 1 && newCount % 20 === 0) {
          setTimeout(() => setTheme("dark"), 0)
          setCooldown(true)
          setTimeout(() => setCooldown(false), 1000)
          return true
        }
        return false
      })

      return newCount
    })
  }

  return (
    <>
      {showBlackScreen && (
        <div
          className="fixed inset-0 bg-black z-[9999] pointer-events-none cursor-none"
          style={{
            background: `radial-gradient(circle 15vw at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, black 100%)`,
          }}
        />
      )}
      <div className="flex flex-col lg:justify-stretch md:pt-10 lg:pt-0 gap-4 lg:gap-8 items-center lg:flex-row">
        <div className="flex flex-col gap-8 w-full max-w-[600px] mx-auto lg:mx-0 lg:order-2">
          <span aria-hidden="true" className="w-full max-w-[300px]">
            <Logo />
          </span>

          <Title size="xl" className="font-medium lg:text-3xl">
            Linjeforeningen for informatikk ved NTNU
          </Title>

          <Text className="md:text-lg max-w-xl">
            Linjeforeningens oppgave er å forbedre studiemiljøet ved å fremme sosialt samvær, faglig kompetanse og
            kontakt med næringslivet.
          </Text>

          <div className="flex flex-col flex-wrap md:flex-row gap-1 md:items-center">
            <div className="flex flex-row gap-2 items-center">
              <Icon icon="tabler:briefcase-filled" className="text-lg" />
              <Text>Er du fra en bedrift og ønsker samarbeid?</Text>
            </div>

            <Button
              variant="text"
              element="a"
              href="https://interesse.online.ntnu.no"
              iconRight={<Icon icon="tabler:arrow-up-right" className="text-base" />}
              className="ml-5 md:ml-0 w-fit"
            >
              Ta kontakt her
            </Button>
          </div>
        </div>

        <div className="lg:-ml-8 relative w-full">
          <div className="relative inset-0 max-w-[600px] aspect-[10/9] mx-auto lg:mx-0">
            {(!mounted || isLoading) && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-stone-800 rounded-xl animate-pulse w-[80%] h-[80%] m-auto" />
            )}

            {mounted && (
              <div
                className={cn(
                  "absolute inset-0 duration-700 transition-opacity",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
              >
                <Spline
                  className={cooldown ? "pointer-events-none" : ""}
                  scene="https://prod.spline.design/cuRaxFhP7TxceRfB/scene.splinecode"
                  onLoad={onSplineLoad}
                  onSplineMouseDown={lightSwitch}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
