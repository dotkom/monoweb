"use client"

import { useEffect, useState } from "react"
import Image from 'next/image'
import { isExplodeMode, isExplodeModeStartAnimation, getRandomExplosionSize, getRandomExplosionPosition } from "@/utils/explosion-easter-egg"
import { Text } from "@dotkomonline/ui"

const GIF_DURATION = 1200 // Time I just guessed

interface Explosion {
  x: number
  y: number
  size: number
  gifUrl: string
}

export function ExplosionEasterEgg() {
  const [explosion, setExplosion] = useState<Explosion | null>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleGlobalClick = (event: PointerEvent) => {
      if (!isExplodeMode()) {
        return
      }

      clearTimeout(timeoutId)

      // Make a fresh url so the gif starts playing from the start
      const freshGifUrl = `/explosion.gif?t=${Date.now()}`

      setExplosion({
        x: event.clientX,
        y: event.clientY,
        size: getRandomExplosionSize(),
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
        {isExplodeModeStartAnimation() && (
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
          }}>
            <Text style={{
              fontSize: "100px",
              fontWeight: "bolder",
              textWrapMode: "nowrap",
              display: "inline-block",
              animation: "spin 0.5s linear infinite",
            }}
            >EXPLOSIONS!!</Text>

            {[...Array(5)].map((_, i) => ( // Make 5 explosions appear together with the spinning text
              <div
                key={getRandomExplosionSize()}
                style={{
                  position: "fixed",
                  top: getRandomExplosionPosition(),
                  left: getRandomExplosionPosition(),
                  transform: "translate(-50%, -50%)",
                  zIndex: 9999,
                  pointerEvents: "none",
                }}>
                <Image
                  src={`/explosion.gif?t=${Date.now()}`}
                  alt=""
                  width={getRandomExplosionSize()}
                  height={getRandomExplosionSize()}
                />
              </div>
            ))}
          </div>
        )}
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
            <Image
              src={explosion.gifUrl}
              alt=""
              width={explosion.size}
              height={explosion.size}
            />
          </div>
        )}
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    )
}
