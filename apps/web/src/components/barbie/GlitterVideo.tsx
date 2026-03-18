"use client"

import { useEffect, useRef } from "react"

export function GlitterVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.playbackRate = 0.5
    }
  }, [])

  return (
    <video ref={ref} autoPlay muted loop playsInline className="h-full w-full object-cover pointer-events-none">
      <source src="/glitter.mp4" type="video/mp4" />
    </video>
  )
}
