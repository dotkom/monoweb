"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { useEffect, useMemo, useRef } from "react"
import type { FC, SVGProps } from "react"
import Link from "next/link"

const NOT_FOUND_QUOTES = [
  "Siden finnes ikke.",
]

/** Trigger all SMIL animate elements in the list */
const beginAll = (refs: React.RefObject<SVGAnimateElement | null>[]) => {
  for (const ref of refs) ref.current?.beginElement()
}

const NotFoundLogo: FC<SVGProps<SVGSVGElement>> = (props) => {
  // Gradient fill-up animation: two stops animate in sync to create a hard edge
  // that rises from bottom to top. Each stop needs its own ref because SMIL
  // begin="id.begin" sync doesn't work reliably in React's DOM.
  const fillRefs = [useRef<SVGAnimateElement>(null), useRef<SVGAnimateElement>(null)]
  const resetRefs = [useRef<SVGAnimateElement>(null), useRef<SVGAnimateElement>(null)]
  const holdingRef = useRef(false)
  const boltRef = useRef<SVGPathElement>(null)
  const shakeFrameRef = useRef<number | null>(null)

  const stopFill = () => {
    if (!holdingRef.current) return
    holdingRef.current = false
    window.removeEventListener("mouseup", stopFill)
    if (shakeFrameRef.current != null) cancelAnimationFrame(shakeFrameRef.current)
    if (boltRef.current) {
      boltRef.current.style.translate = ""
    }
    beginAll(resetRefs)
  }

  const startFill = () => {
    holdingRef.current = true
    beginAll(fillRefs)
    window.addEventListener("mouseup", stopFill, { once: true })

    const startTime = performance.now()
    const shake = () => {
      const elapsed = (performance.now() - startTime) / 1000
      const intensity = Math.min(elapsed * 5, 3)
      const x = (Math.random() - 0.5) * 2 * intensity
      const y = (Math.random() - 0.5) * 2 * intensity
      if (boltRef.current) {
        boltRef.current.style.translate = `${x}px ${y}px`
      }
      shakeFrameRef.current = requestAnimationFrame(shake)
    }
    shakeFrameRef.current = requestAnimationFrame(shake)
  }

  useEffect(() => {
    return () => {
      if (shakeFrameRef.current != null) cancelAnimationFrame(shakeFrameRef.current)
      window.removeEventListener("mouseup", stopFill)
    }
  }, [])

  return (
    <svg
      viewBox="0 0 167 167"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit={2}
      {...props}
    >
      <defs>
        <style>{`
          @keyframes sling {
            0%, 85%, 100% { transform: translate(0, 0) rotate(0deg); }
            89% { transform: translate(0.5px, -0.3px) rotate(1.5deg); }
            92% { transform: translate(-0.7px, 0.3px) rotate(-2deg); }
            95% { transform: translate(0.5px, 0.3px) rotate(1deg); }
            98% { transform: translate(-0.3px, -0.3px) rotate(-0.5deg); }
          }
          .not-found-bolt {
            cursor: pointer;
            transform-origin: center;
            transform-box: fill-box;
            animation: sling 4s ease-in-out infinite;
            transition: scale 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.75);
          }
          .not-found-bolt:hover {
            scale: 1.12;
            animation: none;
          }
          .not-found-bolt:active {
            scale: 0.9;
            animation: none;
          }
        `}</style>
        {/* Two stops at the same offset with different colors create a hard edge.
            Animating both offsets from 1→0 makes the lighter color fill up from the bottom. */}
        <linearGradient id="bolt-gradient" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1">
          <stop offset="1" stopColor="rgb(250, 183, 89)">
            <animate ref={fillRefs[0]} attributeName="offset"
              values="1;0" dur="0.6s" begin="indefinite" fill="freeze"
              calcMode="spline" keySplines="0.8 0 1 1" />
            <animate ref={resetRefs[0]} attributeName="offset"
              values="0;1" dur="0.001s" begin="indefinite" fill="freeze" />
          </stop>
          <stop offset="1" stopColor="rgb(252, 198, 110)">
            <animate ref={fillRefs[1]} attributeName="offset"
              values="1;0" dur="0.6s" begin="indefinite" fill="freeze"
              calcMode="spline" keySplines="0.8 0 1 1" />
            <animate ref={resetRefs[1]} attributeName="offset"
              values="0;1" dur="0.001s" begin="indefinite" fill="freeze" />
          </stop>
        </linearGradient>
      </defs>
      {/* Positioning and scaling the logo to fit the viewBox (exported from vector editor) */}
      <g transform="matrix(1,0,0,1,-1065.04,-69.01)">
        <g transform="matrix(0.470077,0,0,1,531.77,0)">
          <g transform="matrix(2.83642,0,0,1.33333,914.268,-277.944)">
            <g transform="matrix(1,0,0,1,171.299,370.231)">
              <path
                ref={boltRef}
                d="M0,-101.72L-28.406,-59.668L-0.497,-59.312L-54.946,10.118L-33.175,-45.879L-60.813,-45.95L-29.288,-110.015C-29.288,-110.015 -21.027,-109.785 -13.921,-107.785C-6.834,-105.79 0,-101.72 0,-101.72Z"
                fill="url(#bolt-gradient)"
                className="not-found-bolt"
                onMouseDown={() => {
                  startFill()
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              />
            </g>
            <g transform="matrix(0.75,0,0,0.75,0,186.709)">
              <path
                d="M236.622,114.629C239.737,116.969 242.712,119.544 245.548,122.352C253.395,130.276 259.416,139.289 263.611,149.388C267.807,159.488 269.904,170.093 269.904,181.203C269.904,192.313 267.807,202.898 263.611,212.959C259.416,223.02 253.395,232.013 245.548,239.937C237.624,247.862 228.612,253.922 218.512,258.117C208.412,262.312 197.807,264.41 186.697,264.41C179.342,264.41 172.217,263.491 165.322,261.652L185.836,235.386C186.123,235.39 186.41,235.392 186.697,235.392C196.719,235.392 205.829,232.945 214.025,228.051C222.222,223.156 228.767,216.611 233.662,208.414C238.556,200.218 241.003,191.147 241.003,181.203C241.003,171.181 238.556,162.071 233.662,153.875C230.11,147.928 225.69,142.85 220.401,138.642L236.622,114.629ZM178.079,98.428L160.843,133.456C160.388,133.709 159.936,133.97 159.486,134.239C151.29,139.133 144.744,145.679 139.85,153.875C134.955,162.071 132.508,171.181 132.508,181.203C132.508,191.147 134.955,200.218 139.85,208.414C144.337,215.929 150.213,222.057 157.477,226.796L147.204,254.408C140.211,250.596 133.797,245.772 127.963,239.937C120.038,232.013 113.979,223.02 109.783,212.959C105.588,202.898 103.49,192.313 103.49,181.203C103.49,170.093 105.588,159.488 109.783,149.388C113.979,139.289 120.038,130.276 127.963,122.352C135.887,114.505 144.88,108.484 154.941,104.289C162.368,101.192 170.081,99.238 178.079,98.428Z"
                className="fill-[rgb(11,83,116)] dark:fill-white"
                fillRule="nonzero"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

export const NotFoundDefault = () => {
  const quote = useMemo(() => NOT_FOUND_QUOTES[Math.floor(Math.random() * NOT_FOUND_QUOTES.length)], [])

  return (
    <div className="flex flex-col items-center justify-center gap-8 min-h-[calc(100vh-5rem)]">
      <NotFoundLogo className="w-40 h-40" />
      <Title className="text-6xl">404</Title>
      <Text className="text-lg text-slate-500 font-mono italic">{quote}</Text>
      <Button className="w-fit rounded-lg px-6 py-3" color="brand" element={Link} href="/">
        Gå til forsiden
      </Button>
    </div>
  )
}
