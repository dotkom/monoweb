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
}

export const CompanySplash: FC = () => {
  const { theme, setTheme } = useTheme()

  const [isLoading, setIsLoading] = useState<boolean>(true)

  const themeState = useRef<string | undefined>(theme)
  const splineRef = useRef<SplineInstance | null>(null)

  useEffect(() => {
    themeState.current = theme

    if (splineRef.current?.setVariable) {
      updateSplineDarkMode(theme === "dark")
    }
  }, [theme])

  const onSplineLoad = (spline: SplineInstance) => {
    splineRef.current = spline
    // Initialize Spline with current theme
    updateSplineDarkMode(theme === "dark")
    setIsLoading(false)
  }

  const updateSplineDarkMode = (darkModeValue: boolean) => {
    if (splineRef.current?.setVariable) {
      splineRef.current.setVariable("darkmode", darkModeValue)
    }
  }

  const lightSwitch = () => {
    const currentTheme = themeState.current
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex flex-col lg:justify-stretch gap-4 items-center lg:flex-row">
      <div className="flex flex-col gap-8 w-full max-w-[600px] mx-auto lg:mx-0">
        <span aria-hidden="true" className="w-full max-w-[300px]">
          <Logo />
        </span>

        <Title size="xl" className="font-medium lg:text-3xl">
          Linjeforeningen for informatikk ved NTNU
        </Title>

        <Text className="md:text-lg max-w-xl">
          Her burde det stå en kort tekst om linjeforeningen og hva vi gjør. Helst ikke mer enn to setninger
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

      <div className="relative w-full">
        {isLoading && (
          <div className="absolute bg-gray-100 dark:bg-stone-900 rounded-xl animate-pulse w-[80%] h-[80%] inset-0 m-auto" />
        )}
        <div
          className={cn(
            "inset-0 max-w-[600px] aspect-[10/9] mx-auto lg:mx-0 duration-700 transition-opacity",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        >
          <Spline
            scene="https://prod.spline.design/VwzWzojgCJ6CErSI/scene.splinecode"
            onLoad={onSplineLoad}
            onSplineMouseDown={lightSwitch}
          />
        </div>
      </div>
    </div>
  )
}
