"use client"

import { useEffect, useState } from "react"
import { hasPassedThemeChangeThreshold, getRandomExplosionSize } from "@/utils/explosion-easter-egg"

const GIF_DURATION = 1200

interface Explosion {
  x: number
  y: number
  gifUrl: string
}

export default function ExplosionEasterEgg() {
  const [explosion, setExplosion] = useState<Explosion | null>(null)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const handleGlobalClick = (event: PointerEvent) => {
      if (!hasPassedThemeChangeThreshold()) {
        return
      }

      clearTimeout(timeoutId)

      // Make a fresh url so the gif starts playing from the start
      const freshGifUrl = `/explosion.gif?t=${Date.now()}`

      setExplosion({
        x: event.clientX,
        y: event.clientY,
        gifUrl: freshGifUrl,
      })

      timeoutId = setTimeout(() => {
        setExplosion(null)
      }, GIF_DURATION)
    }

    document.addEventListener("pointerdown", handleGlobalClick, {
      capture: true,
    })

    return () => {
      document.removeEventListener("pointerdown", handleGlobalClick, {
        capture: true,
      })

      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <>
      {explosion && (
        <div
          style={{
            position: "fixed",
            top: explosion.y,
            left: explosion.x,
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          <img
            src={explosion.gifUrl}
            alt=""
            width={getRandomExplosionSize()}  // burde har noko storleik variasjon, random idk korleis
            height={getRandomExplosionSize()} // burde har noko storleik variasjon, random idk korleis
          />
        </div>
      )}
    </>
  )
}
