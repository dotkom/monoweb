"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"

const STYLE_ID = "sixty-seven-style"

const CSS = `
@keyframes sixty-seven-wobble {
  0%   { transform: translateY(0) rotate(0deg); }
  12%  { transform: translateY(-40px) rotate(-5deg); }
  25%  { transform: translateY(35px) rotate(4.5deg); }
  37%  { transform: translateY(-30px) rotate(-4deg); }
  50%  { transform: translateY(25px) rotate(3.5deg); }
  62%  { transform: translateY(-20px) rotate(-2.5deg); }
  75%  { transform: translateY(15px) rotate(2deg); }
  87%  { transform: translateY(-8px) rotate(-1deg); }
  100% { transform: translateY(0) rotate(0deg); }
}
html.sixty-seven-wobble {
  animation: sixty-seven-wobble 2s ease-in-out 5;
  overflow-x: hidden;
}
`

export const SixtySevenShake = ({ active, children }: { active: boolean; children: ReactNode }) => {
  useEffect(() => {
    if (!active) return

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style")
      style.id = STYLE_ID
      style.textContent = CSS
      document.head.appendChild(style)
    }

    // Calculate the visible center of the viewport relative to the full document
    const originY = window.scrollY + window.innerHeight / 2
    document.documentElement.style.transformOrigin = `80% ${originY}px`
    document.documentElement.classList.add("sixty-seven-wobble")

    const timer = setTimeout(() => {
      document.documentElement.classList.remove("sixty-seven-wobble")
      document.documentElement.style.transformOrigin = ""
    }, 10000)

    return () => {
      clearTimeout(timer)
      document.documentElement.classList.remove("sixty-seven-wobble")
      document.documentElement.style.transformOrigin = ""
    }
  }, [active])

  return <>{children}</>
}
