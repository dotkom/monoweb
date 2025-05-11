"use client"

import { Button } from "@dotkomonline/ui"
import Spline from "@splinetool/react-spline"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Logo } from "./Logo"

interface SplineInstance {
  setVariable?: (name: string, value: boolean | number | string) => void
}

export const CompanySplash: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false)
  const splineRef = useRef<SplineInstance | null>(null)
  const themeState = useRef<string | undefined>(theme)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Keep track of the latest theme in a ref
  useEffect(() => {
    themeState.current = theme
  }, [theme])

  // Update Spline dark mode when theme changes
  useEffect(() => {
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
    // Use the ref to get the current theme state
    const currentTheme = themeState.current

    // Toggle the theme based on the ref value
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }

  return (
    <section>
      <div
        className={`mb-6 lg:my-4 lg:mb-10 transition-opacity duration-700 ${
          isPageLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col lg:items-center lg:flex-row lg:justify-between text-center lg:text-left">
          <div className="w-full lg:w-[50%] px-6 lg:pr-0 lg:pl-16 lg:pb-8 transition-opacity duration-700 delay-100">
            <h1 className="relative font-bold pb-2 transition-opacity duration-700 delay-200">
              {/* Transparent text over the logo to make "Online" selectable and screen-reader accessible. Makes the logo behave like part of the text during selection. */}
              <span className="font-poppins absolute text-transparent text-[94px] leading-[80px] tracking-[-2px] height-[80px] inset-0 lg:inset-auto">
                Online
              </span>
              <span
                aria-hidden="true"
                className="block max-w-[300px] w-full pb-4 mx-auto lg:mx-0 transition-opacity duration-700 delay-300"
              >
                <Logo />
              </span>
              <span className="font-fraunces text-xl md:text-2xl lg:text-3xl block transition-opacity duration-700 delay-400">
                Linjeforeningen for Informatikk ved NTNU
              </span>
            </h1>
            <p className="font-poppins text-md md:text-lg max-w-xl mb-4 lg:mb-8 mx-auto lg:mx-0 transition-opacity duration-700 delay-500">
              {/* Informatikkstudiet hører til Institutt for datateknologi og 
              informatikk (IDI). Dette innebærer blant annet å lære om utvikling, 
              forbedring, evaluering og bruk av datasystemer. For mer informasjon 
              om studiet, se NTNU sine offisielle nettsider for bachelor og master. */}
              Her burde det stå en kort tekst om linjeforeningen og hva vi gjør. Helst ikke mer enn to setninger
            </p>
            <Link href="https://interesse.online.ntnu.no">
              <Button>Bedriftskontakt</Button>
            </Link>
          </div>
          <div
            className={`w-full lg:w-[50%] relative transition-opacity duration-700 delay-700 ${
              isPageLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-blue-7">
                <svg
                  className="animate-spin h-12 w-12"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <title>Loading...</title>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
            <div className="w-full aspect-[10/9] max-w-[600px] mx-auto">
              <Spline
                scene="https://prod.spline.design/yapmhg7y5iZdf9u4/scene.splinecode"
                onLoad={onSplineLoad}
                onSplineMouseDown={lightSwitch}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
