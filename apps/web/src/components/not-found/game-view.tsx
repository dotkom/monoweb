"use client"

import { useCallback, useEffect, useRef } from "react"
import { startGame } from "./game"

interface NotFoundGameViewProps {
  onExit?: () => void
}

export const NotFoundGameView = ({ onExit }: NotFoundGameViewProps) => {
  const cleanupRef = useRef<(() => void) | null>(null)
  const onExitRef = useRef(onExit)
  onExitRef.current = onExit

  const handleCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    cleanupRef.current?.()
    cleanupRef.current = null

    if (canvas) {
      cleanupRef.current = startGame(canvas, () => onExitRef.current?.())
    }
  }, [])

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
    }
  }, [])

  return (
    <div className="w-full" style={{ aspectRatio: "16 / 9" }}>
      <canvas ref={handleCanvas} className="w-full h-full" />
    </div>
  )
}
