"use client"

import { useEffect, useRef, useState } from "react"

export function GlitterVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [shouldPlay, setShouldPlay] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setShouldPlay(!mq.matches)

    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!ref.current) return
    ref.current.playbackRate = 0.5
    shouldPlay ? ref.current.play() : ref.current.pause()
  }, [shouldPlay])

  return (
    <video
      ref={ref}
      autoPlay={shouldPlay}
      muted
      loop
      playsInline
      className="h-full w-full object-cover pointer-events-none"
    >
      <source src="/glitter.mp4" type="video/mp4" />
    </video>
  )
}
