"use client"

import { cn } from "@dotkomonline/ui"
import { useCallback, useEffect, useRef, useState } from "react"
import type { MascotConfig } from "./easter-eggs"
import "./desktop-goose.css"

// ========== CONSTANTS ==========

const SPRITE_SIZE = 64
const MOVE_SPEED = 1.5
const TICK_MS = 16
const FOOTPRINT_INTERVAL = 40
const FOOTPRINT_LIFETIME = 4000
const MAX_FOOTPRINTS = 30
const NOTE_DROP_MIN = 12000
const NOTE_DROP_MAX = 25000
const MAX_NOTES = 5
const IDLE_MIN = 2000
const IDLE_MAX = 5000
const ARRIVE_THRESHOLD = 5
const VIEWPORT_PADDING = 50

// ========== TYPES ==========

interface Position {
  x: number
  y: number
}

interface Footprint {
  id: number
  x: number
  y: number
  rotation: number
  createdAt: number
}

interface DroppedNote {
  id: number
  x: number
  y: number
  rotation: number
  message: string
  dismissing: boolean
}

type MascotState = "walking" | "idle" | "dropping-note"

// ========== BUILT-IN SPRITES ==========

function GooseSVG({ facing }: { facing: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={SPRITE_SIZE}
      height={SPRITE_SIZE}
      style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      <ellipse cx="32" cy="40" rx="18" ry="14" fill="white" stroke="#333" strokeWidth="1.5" />
      <path d="M 38 30 Q 40 18 36 10" fill="none" stroke="white" strokeWidth="8" />
      <path d="M 38 30 Q 40 18 36 10" fill="none" stroke="#333" strokeWidth="1.5" />
      <circle cx="35" cy="10" r="7" fill="white" stroke="#333" strokeWidth="1.5" />
      <circle cx="37" cy="9" r="1.5" fill="#111" />
      <polygon points="42,10 48,12 42,14" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
      <line x1="26" y1="52" x2="24" y2="60" stroke="#f59e0b" strokeWidth="2" />
      <line x1="36" y1="52" x2="38" y2="60" stroke="#f59e0b" strokeWidth="2" />
      <line x1="24" y1="60" x2="20" y2="62" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="38" y1="60" x2="42" y2="62" stroke="#f59e0b" strokeWidth="1.5" />
    </svg>
  )
}

function BarbarianSVG({ facing }: { facing: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={SPRITE_SIZE}
      height={SPRITE_SIZE}
      style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    >
      {/* Sword (behind body) */}
      <rect x="44" y="8" width="3" height="28" rx="1" fill="#b0b0b0" stroke="#666" strokeWidth="0.7" transform="rotate(15, 45, 22)" />
      <rect x="43" y="34" width="5" height="6" rx="1" fill="#8B6914" stroke="#5a4510" strokeWidth="0.5" transform="rotate(15, 45, 37)" />
      {/* Legs */}
      <rect x="24" y="44" width="6" height="12" rx="2" fill="#e8a86b" stroke="#b87333" strokeWidth="0.7" />
      <rect x="34" y="44" width="6" height="12" rx="2" fill="#dea060" stroke="#b87333" strokeWidth="0.7" />
      {/* Boots */}
      <ellipse cx="27" cy="57" rx="5" ry="3" fill="#6b4226" stroke="#3d2510" strokeWidth="0.5" />
      <ellipse cx="37" cy="57" rx="5" ry="3" fill="#6b4226" stroke="#3d2510" strokeWidth="0.5" />
      {/* Body (muscular torso) */}
      <ellipse cx="32" cy="36" rx="14" ry="12" fill="#e8a86b" stroke="#b87333" strokeWidth="1" />
      {/* Belt / kilt */}
      <rect x="19" y="42" width="26" height="8" rx="2" fill="#8B6914" stroke="#5a4510" strokeWidth="0.7" />
      <rect x="29" y="42" width="6" height="4" rx="1" fill="#c0c0c0" stroke="#888" strokeWidth="0.5" />
      {/* Chest details */}
      <line x1="32" y1="28" x2="32" y2="40" stroke="#c48a50" strokeWidth="0.7" />
      {/* Spiked wristbands */}
      <rect x="16" y="38" width="5" height="4" rx="1" fill="#555" stroke="#333" strokeWidth="0.5" />
      <rect x="43" y="38" width="5" height="4" rx="1" fill="#555" stroke="#333" strokeWidth="0.5" />
      {/* Arms */}
      <rect x="14" y="30" width="7" height="12" rx="3" fill="#e8a86b" stroke="#b87333" strokeWidth="0.7" />
      <rect x="43" y="30" width="7" height="12" rx="3" fill="#dea060" stroke="#b87333" strokeWidth="0.7" />
      {/* Head */}
      <circle cx="32" cy="18" r="10" fill="#e8a86b" stroke="#b87333" strokeWidth="1" />
      {/* Hair (short spiky blonde) */}
      <path d="M 23 16 Q 24 6 28 8 Q 30 4 33 7 Q 36 3 38 8 Q 41 6 41 16" fill="#f0c040" stroke="#c8a020" strokeWidth="0.7" />
      {/* Eyes */}
      <circle cx="28" cy="17" r="1.8" fill="white" />
      <circle cx="36" cy="17" r="1.8" fill="white" />
      <circle cx="28.5" cy="17.2" r="1" fill="#2563eb" />
      <circle cx="36.5" cy="17.2" r="1" fill="#2563eb" />
      {/* Angry eyebrows */}
      <line x1="25" y1="13.5" x2="30" y2="14.5" stroke="#c8a020" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="14.5" x2="39" y2="13.5" stroke="#c8a020" strokeWidth="1.5" strokeLinecap="round" />
      {/* Horseshoe mustache */}
      <path d="M 28 21 Q 32 24 36 21 L 36 25 Q 34 23 32 24 Q 30 23 28 25 Z" fill="#f0c040" stroke="#c8a020" strokeWidth="0.5" />
      {/* Mouth (battle grin) */}
      <path d="M 29 22 Q 32 25 35 22" fill="none" stroke="#8B4513" strokeWidth="0.8" />
    </svg>
  )
}

const BUILT_IN_SPRITES: Record<string, (facing: "left" | "right") => React.ReactNode> = {
  goose: (facing) => <GooseSVG facing={facing} />,
  barbarian: (facing) => <BarbarianSVG facing={facing} />,
}

// ========== UTILITIES ==========

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function clampToViewport(pos: Position): Position {
  return {
    x: Math.max(0, Math.min(pos.x, window.innerWidth - SPRITE_SIZE)),
    y: Math.max(0, Math.min(pos.y, window.innerHeight - SPRITE_SIZE)),
  }
}

function distance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function pickRandomViewportTarget(): Position {
  return {
    x: randomBetween(VIEWPORT_PADDING, window.innerWidth - SPRITE_SIZE - VIEWPORT_PADDING),
    y: randomBetween(VIEWPORT_PADDING, window.innerHeight - SPRITE_SIZE - VIEWPORT_PADDING),
  }
}

function pickRandomEdgeStart(): Position {
  const edge = Math.floor(Math.random() * 4)
  switch (edge) {
    case 0:
      return { x: randomBetween(0, window.innerWidth - SPRITE_SIZE), y: -SPRITE_SIZE }
    case 1:
      return { x: window.innerWidth, y: randomBetween(0, window.innerHeight - SPRITE_SIZE) }
    case 2:
      return { x: randomBetween(0, window.innerWidth - SPRITE_SIZE), y: window.innerHeight }
    default:
      return { x: -SPRITE_SIZE, y: randomBetween(0, window.innerHeight - SPRITE_SIZE) }
  }
}

// ========== COMPONENT ==========

interface WanderingMascotProps {
  config: MascotConfig
}

export function WanderingMascot({ config }: WanderingMascotProps) {
  const footprint = config.footprint ?? "🐾"
  const clickText = config.clickText ?? "HONK!"
  const notes = config.notes

  const renderSprite = useCallback(
    (facing: "left" | "right") => {
      if (typeof config.sprite === "function") {
        return config.sprite(facing)
      }
      // Check built-in sprites
      const builtIn = BUILT_IN_SPRITES[config.sprite]
      if (builtIn) {
        return builtIn(facing)
      }
      // Treat as emoji
      return (
        <span
          className="text-5xl leading-none select-none"
          style={{ transform: facing === "left" ? "scaleX(-1)" : undefined, display: "inline-block" }}
          aria-hidden="true"
        >
          {config.sprite}
        </span>
      )
    },
    [config.sprite]
  )

  const [position, setPosition] = useState<Position>({ x: -200, y: -200 })
  const [facing, setFacing] = useState<"left" | "right">("right")
  const [mascotState, setMascotState] = useState<MascotState>("walking")
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [droppedNotes, setDroppedNotes] = useState<DroppedNote[]>([])
  const [honking, setHonking] = useState(false)
  const [mounted, setMounted] = useState(false)

  const posRef = useRef<Position>({ x: -200, y: -200 })
  const targetRef = useRef<Position>({ x: 200, y: 200 })
  const stateRef = useRef<MascotState>("walking")
  const footprintIdRef = useRef(0)
  const noteIdRef = useRef(0)
  const lastFootprintPosRef = useRef<Position>({ x: 0, y: 0 })

  const pickNewTarget = useCallback(() => {
    targetRef.current = pickRandomViewportTarget()
  }, [])

  const dismissNote = useCallback((id: number) => {
    setDroppedNotes((prev) => prev.map((n) => (n.id === id ? { ...n, dismissing: true } : n)))
    setTimeout(() => {
      setDroppedNotes((prev) => prev.filter((n) => n.id !== id))
    }, 300)
  }, [])

  const handleClick = useCallback(() => {
    setHonking(true)
    setTimeout(() => setHonking(false), 800)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    const startPos = pickRandomEdgeStart()
    posRef.current = startPos
    setPosition(startPos)
    targetRef.current = pickRandomViewportTarget()
    console.log("[Mascot] Game loop started, startPos:", startPos, "target:", targetRef.current)

    const intervalId = setInterval(() => {
      const state = stateRef.current
      const pos = posRef.current

      if (state === "walking") {
        const dx = targetRef.current.x - pos.x
        const dy = targetRef.current.y - pos.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < ARRIVE_THRESHOLD) {
          console.log("[Mascot] Reached target, going idle")
          stateRef.current = "idle"
          setMascotState("idle")
          const idleDuration = randomBetween(IDLE_MIN, IDLE_MAX)
          setTimeout(() => {
            if (stateRef.current === "idle") {
              pickNewTarget()
              stateRef.current = "walking"
              setMascotState("walking")
            }
          }, idleDuration)
        } else {
          const moveX = (dx / dist) * MOVE_SPEED
          const moveY = (dy / dist) * MOVE_SPEED
          const newPos = clampToViewport({
            x: pos.x + moveX,
            y: pos.y + moveY,
          })
          posRef.current = newPos
          setPosition(newPos)
          setFacing(moveX >= 0 ? "right" : "left")

          const fpDist = distance(newPos, lastFootprintPosRef.current)
          if (fpDist >= FOOTPRINT_INTERVAL) {
            const id = footprintIdRef.current++
            lastFootprintPosRef.current = { ...newPos }
            setFootprints((prev) => [
              ...prev.slice(-(MAX_FOOTPRINTS - 1)),
              {
                id,
                x: newPos.x + SPRITE_SIZE / 2 - 8,
                y: newPos.y + SPRITE_SIZE - 4,
                rotation: Math.atan2(dy, dx) * (180 / Math.PI) + 90,
                createdAt: Date.now(),
              },
            ])
          }
        }
      }
    }, TICK_MS)

    const cleanupId = setInterval(() => {
      const now = Date.now()
      setFootprints((prev) => prev.filter((fp) => now - fp.createdAt < FOOTPRINT_LIFETIME))
    }, 1000)

    let noteTimeoutId: ReturnType<typeof setTimeout>
    const scheduleNoteDrop = () => {
      noteTimeoutId = setTimeout(() => {
        if (stateRef.current === "walking") {
          console.log("[Mascot] Dropping a note")
          stateRef.current = "dropping-note"
          setMascotState("dropping-note")

          const id = noteIdRef.current++
          const pos = posRef.current
          setDroppedNotes((prev) => [
            ...prev.slice(-(MAX_NOTES - 1)),
            {
              id,
              x: Math.min(pos.x, window.innerWidth - 220),
              y: pos.y + SPRITE_SIZE,
              rotation: randomBetween(-8, 8),
              message: randomChoice(notes),
              dismissing: false,
            },
          ])

          setTimeout(() => {
            if (stateRef.current === "dropping-note") {
              pickNewTarget()
              stateRef.current = "walking"
              setMascotState("walking")
            }
          }, 1500)
        }
        scheduleNoteDrop()
      }, randomBetween(NOTE_DROP_MIN, NOTE_DROP_MAX))
    }
    scheduleNoteDrop()

    return () => {
      clearInterval(intervalId)
      clearInterval(cleanupId)
      clearTimeout(noteTimeoutId)
    }
  }, [mounted, pickNewTarget, notes])

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Footprints layer */}
      <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden" aria-hidden="true">
        {footprints.map((fp) => (
          <div
            key={fp.id}
            className="absolute text-sm desktop-goose__footprint"
            style={{
              left: fp.x,
              top: fp.y,
              transform: `rotate(${fp.rotation}deg)`,
            }}
          >
            {footprint}
          </div>
        ))}
      </div>

      {/* Notes layer */}
      <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden" aria-hidden="true">
        {droppedNotes.map((note) => (
          <button
            type="button"
            key={note.id}
            className={cn(
              "absolute p-3 bg-yellow-100 shadow-md rounded-sm",
              "text-sm text-gray-800 font-mono whitespace-pre-line text-left",
              "pointer-events-auto cursor-pointer select-none",
              "hover:bg-yellow-200 transition-colors",
              "desktop-goose__note",
              note.dismissing && "desktop-goose__note--dismissing"
            )}
            style={
              {
                left: note.x,
                top: note.y,
                "--note-rotation": `${note.rotation}deg`,
                maxWidth: 200,
              } as React.CSSProperties
            }
            onClick={() => dismissNote(note.id)}
          >
            {note.message}
          </button>
        ))}
      </div>

      {/* Mascot sprite */}
      <div
        className={cn(
          "fixed z-40",
          mascotState === "walking" && "desktop-goose--waddle",
          (mascotState === "idle" || mascotState === "dropping-note") && "desktop-goose--idle"
        )}
        style={{
          left: position.x,
          top: position.y,
          width: SPRITE_SIZE,
          height: SPRITE_SIZE,
        }}
        aria-hidden="true"
      >
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none p-0"
          onClick={handleClick}
          tabIndex={-1}
          aria-hidden="true"
        >
          {renderSprite(facing)}
        </button>

        {honking && (
          <div className="absolute -top-8 left-1/2 text-lg font-bold text-amber-600 desktop-goose__honk whitespace-nowrap pointer-events-none">
            {clickText}
          </div>
        )}
      </div>
    </>
  )
}
