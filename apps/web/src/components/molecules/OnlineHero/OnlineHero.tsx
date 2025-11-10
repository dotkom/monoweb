"use client"

import { Button, Text, cn } from "@dotkomonline/ui"
import { Title } from "@dotkomonline/ui"
import Spline from "@splinetool/react-spline"
import { IconArrowUpRight, IconBriefcase } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
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

    if (splineRef.current?.getVariable) {
      const numberValue = splineRef.current.getVariable("lightSwitchCounter") as number

      // Potential for an easteregg if you spam the lightswitch
      // For now just an alert
      if (numberValue > 1 && numberValue % 69 === 0) {
        alert("Ey yo, det holder nå")
      }
    }
  }

  return (
    <div className="flex flex-col lg:justify-stretch md:pt-10 lg:pt-0 gap-4 lg:gap-8 items-center lg:flex-row">
      <div className="flex flex-col gap-8 w-full max-w-[600px] mx-auto lg:mx-0 lg:order-2">
        <span aria-hidden="true" className="w-full max-w-[300px]">
          <Logo />
        </span>
        <Title size="xl" className="font-medium lg:text-3xl">
          Linjeforeningen for informatikk ved NTNU
        </Title>
        <div>
          <div className="flex flex-row gap-2 items-center">
            <IconBriefcase className="w-5 h-5" />
            <Text>Er du fra en bedrift og ønsker samarbeid?</Text>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              variant="solid"
              color="brand"
              element="a"
              href="https://interesse.online.ntnu.no"
              iconRight={<IconArrowUpRight className="w-4 h-4" />}
            >
              Ta kontakt
            </Button>
            <Button variant="solid" element={Link} href="/om-linjeforeningen">
              Les mer om oss
            </Button>
          </div>
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
                scene="https://prod.spline.design/cuRaxFhP7TxceRfB/scene.splinecode"
                onLoad={onSplineLoad}
                onSplineMouseDown={lightSwitch}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
