"use client"

import { Link } from "@/components/link"
import { cn } from "@dotkomonline/ui"
import { secondsToMilliseconds } from "date-fns"
import Image from "next/image"
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"

const FACE_SIZE = 150
const HAND_SIZE = 62.5

const ENTER_HAND_FRAME_MS = 180
const EXIT_SLIDE_MS = 1000
const HIDDEN_PAUSE_MS = secondsToMilliseconds(1.2)
const REACTION_END_HOLD_MS = secondsToMilliseconds(1.8)
const IDLE_ACTION_MIN_DELAY_MS = secondsToMilliseconds(8)
const IDLE_ACTION_MAX_DELAY_MS = secondsToMilliseconds(16)

const BRAGE_FACE = "/birthday-doom/brage-face.png"
const BRAGE_FACE_CURIOUS = "/birthday-doom/brage-face-curious.png"
const BRAGE_FACE_DISGUSTED = "/birthday-doom/brage-face-disgusted.png"
const BRAGE_FACE_DISGUSTED_2 = "/birthday-doom/brage-face-disgusted-2.png"
const BRAGE_FACE_LEFT = "/birthday-doom/brage-face-left.png"
const BRAGE_FACE_POSITIVE = "/birthday-doom/brage-face-positive.png"
const BRAGE_FACE_RIGHT = "/birthday-doom/brage-face-right.png"
const BRAGE_FACE_SNEEZE = "/birthday-doom/brage-face-sneeze.png"
const BRAGE_FACE_SNEEZE_2 = "/birthday-doom/brage-face-sneeze-2.png"
const BRAGE_FACE_UNCERTAIN = "/birthday-doom/brage-face-uncertain.png"
const BRAGE_HAND_OPEN_LEFT = "/birthday-doom/brage-hand-open-left.png"
const BRAGE_HAND_OPEN_RIGHT = "/birthday-doom/brage-hand-open-right.png"
const BRAGE_HAND_HALF_LEFT = "/birthday-doom/brage-hand-half-left.png"
const BRAGE_HAND_HALF_RIGHT = "/birthday-doom/brage-hand-half-right.png"
const BRAGE_HAND_CLOSED_LEFT = "/birthday-doom/brage-hand-closed-left.png"
const BRAGE_HAND_CLOSED_RIGHT = "/birthday-doom/brage-hand-closed-right.png"
const BRAGE_HAND_NAH = "/birthday-doom/brage-hand-nah.png"
const BRAGE_HAND_THUMBS_UP = "/birthday-doom/brage-hand-thumbs-up.png"
const BRAGE_HAND_OK = "/birthday-doom/brage-hand-ok.png"

const ANDRE_FACE = "/birthday-doom/andre-face.png"
const ANDRE_FACE_CURIOUS = "/birthday-doom/andre-face-curious.png"
const ANDRE_FACE_DISGUSTED = "/birthday-doom/andre-face-disgusted.png"
const ANDRE_FACE_LEFT = "/birthday-doom/andre-face-left.png"
const ANDRE_FACE_RIGHT = "/birthday-doom/andre-face-right.png"
const ANDRE_FACE_SKEPTICAL = "/birthday-doom/andre-face-skeptical.png"
const ANDRE_FACE_UNCERTAIN = "/birthday-doom/andre-face-uncertain.png"
const ANDRE_HAND_OPEN_LEFT = "/birthday-doom/andre-hand-open-left.png"
const ANDRE_HAND_OPEN_RIGHT = "/birthday-doom/andre-hand-open-right.png"
const ANDRE_HAND_HALF_LEFT = "/birthday-doom/andre-hand-half-left.png"
const ANDRE_HAND_HALF_RIGHT = "/birthday-doom/andre-hand-half-right.png"
const ANDRE_HAND_CLOSED_LEFT = "/birthday-doom/andre-hand-closed-left.png"
const ANDRE_HAND_CLOSED_RIGHT = "/birthday-doom/andre-hand-closed-right.png"
const ANDRE_HAND_NAH = "/birthday-doom/andre-hand-nah.png"
const ANDRE_HAND_THUMBS_UP = "/birthday-doom/andre-hand-thumbs-up.png"

const SLIDE_TRANSITION_CLASS_NAME =
  "transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"

export const DOOM_CHARACTERS = ["brage", "andre"] as const
export type DoomCharacter = (typeof DOOM_CHARACTERS)[number]

const CHARACTER_PROFILE_HREF: Record<DoomCharacter, string> = {
  andre: "/profil/andre",
  brage: "/profil/dotkom",
}

const CHARACTER_PROFILE_LABEL: Record<DoomCharacter, string> = {
  andre: "Gå til Andrés profil",
  brage: "Gå til Brages profil",
}

type HandPose = {
  src: string | null
  className?: string
  zIndexClassName?: string
}

export type DoomPose = {
  faceSrc: string
  leftHand: HandPose
  rightHand: HandPose
}

type PoseKeyframe = {
  poseName: string
  durationMs: number
}

type AnimationPhase = "entering" | "idle" | "acting" | "reacting" | "exiting"

const BRAGE_CLOSED_LEFT: HandPose = { src: BRAGE_HAND_CLOSED_LEFT, zIndexClassName: "z-2" }
const BRAGE_CLOSED_RIGHT: HandPose = { src: BRAGE_HAND_CLOSED_RIGHT, zIndexClassName: "z-2" }

const ANDRE_CLOSED_LEFT: HandPose = { src: ANDRE_HAND_CLOSED_LEFT, className: "top-14 right-5", zIndexClassName: "z-2" }
const ANDRE_CLOSED_RIGHT: HandPose = {
  src: ANDRE_HAND_CLOSED_RIGHT,
  className: "top-14 -left-1",
  zIndexClassName: "z-2",
}

export const BRAGE_POSES = {
  enter1: {
    faceSrc: BRAGE_FACE,
    leftHand: { src: BRAGE_HAND_OPEN_LEFT, className: "top-10", zIndexClassName: "z-1" },
    rightHand: { src: BRAGE_HAND_OPEN_RIGHT, className: "top-10", zIndexClassName: "z-1" },
  },
  enter2: {
    faceSrc: BRAGE_FACE,
    leftHand: { src: BRAGE_HAND_HALF_LEFT, className: "top-14", zIndexClassName: "z-1" },
    rightHand: { src: BRAGE_HAND_HALF_RIGHT, className: "top-14", zIndexClassName: "z-1" },
  },
  enter3: {
    faceSrc: BRAGE_FACE,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: BRAGE_CLOSED_RIGHT,
  },
  idle: {
    faceSrc: BRAGE_FACE,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: BRAGE_CLOSED_RIGHT,
  },
  curious: {
    faceSrc: BRAGE_FACE_CURIOUS,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: BRAGE_CLOSED_RIGHT,
  },
  disgusted: {
    faceSrc: BRAGE_FACE_DISGUSTED,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: { src: BRAGE_HAND_NAH, className: "top-10 -left-3", zIndexClassName: "z-2" },
  },
  disgusted2: {
    faceSrc: BRAGE_FACE_DISGUSTED_2,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: BRAGE_CLOSED_RIGHT,
  },
  left: {
    faceSrc: BRAGE_FACE_LEFT,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: BRAGE_CLOSED_RIGHT,
  },
  positive: {
    faceSrc: BRAGE_FACE_POSITIVE,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: { src: BRAGE_HAND_THUMBS_UP, className: "top-10", zIndexClassName: "z-2" },
  },
  positive2: {
    faceSrc: BRAGE_FACE_POSITIVE,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: { src: BRAGE_HAND_OK, className: "top-10", zIndexClassName: "z-2" },
  },
  right: {
    faceSrc: BRAGE_FACE_RIGHT,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: BRAGE_CLOSED_RIGHT,
  },
  sneeze: {
    faceSrc: BRAGE_FACE_SNEEZE,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: BRAGE_CLOSED_RIGHT,
  },
  sneeze2: {
    faceSrc: BRAGE_FACE_SNEEZE_2,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: BRAGE_CLOSED_RIGHT,
  },
  uncertain: {
    faceSrc: BRAGE_FACE_UNCERTAIN,
    leftHand: BRAGE_CLOSED_LEFT,
    rightHand: BRAGE_CLOSED_RIGHT,
  },
} as const satisfies Record<string, DoomPose>

export const ANDRE_POSES = {
  enter1: {
    faceSrc: ANDRE_FACE,
    leftHand: { src: ANDRE_HAND_OPEN_LEFT, className: "top-10 right-5", zIndexClassName: "z-1" },
    rightHand: { src: ANDRE_HAND_OPEN_RIGHT, className: "top-10 -left-1", zIndexClassName: "z-1" },
  },
  enter2: {
    faceSrc: ANDRE_FACE,
    leftHand: { src: ANDRE_HAND_HALF_LEFT, className: "top-13 right-5", zIndexClassName: "z-1" },
    rightHand: { src: ANDRE_HAND_HALF_RIGHT, className: "top-13 -left-1", zIndexClassName: "z-1" },
  },
  enter3: {
    faceSrc: ANDRE_FACE,
    leftHand: ANDRE_CLOSED_LEFT,
    rightHand: ANDRE_CLOSED_RIGHT,
  },
  idle: {
    faceSrc: ANDRE_FACE,
    leftHand: ANDRE_CLOSED_LEFT,
    rightHand: ANDRE_CLOSED_RIGHT,
  },
  curious: {
    faceSrc: ANDRE_FACE_CURIOUS,
    leftHand: ANDRE_CLOSED_LEFT,
    rightHand: ANDRE_CLOSED_RIGHT,
  },
  positive: {
    faceSrc: ANDRE_FACE_CURIOUS,
    leftHand: ANDRE_CLOSED_LEFT,
    rightHand: { src: ANDRE_HAND_THUMBS_UP, className: "top-10", zIndexClassName: "z-2" },
  },
  disgusted: {
    faceSrc: ANDRE_FACE_DISGUSTED,
    leftHand: ANDRE_CLOSED_LEFT,
    rightHand: { src: ANDRE_HAND_NAH, className: "top-9 -left-2", zIndexClassName: "z-2" },
  },
  left: {
    faceSrc: ANDRE_FACE_LEFT,
    leftHand: ANDRE_CLOSED_LEFT,
    rightHand: ANDRE_CLOSED_RIGHT,
  },
  right: {
    faceSrc: ANDRE_FACE_RIGHT,
    leftHand: ANDRE_CLOSED_LEFT,
    rightHand: ANDRE_CLOSED_RIGHT,
  },
  skeptical: {
    faceSrc: ANDRE_FACE_SKEPTICAL,
    leftHand: ANDRE_CLOSED_LEFT,
    rightHand: { src: null },
  },
  uncertain: {
    faceSrc: ANDRE_FACE_UNCERTAIN,
    leftHand: ANDRE_CLOSED_LEFT,
    rightHand: ANDRE_CLOSED_RIGHT,
  },
} as const satisfies Record<string, DoomPose>

export type BragePoseName = keyof typeof BRAGE_POSES
export type AndrePoseName = keyof typeof ANDRE_POSES
export type DoomPoseName = BragePoseName | AndrePoseName

export const BRAGE_POSE_NAMES = [
  "enter1",
  "enter2",
  "enter3",
  "idle",
  "curious",
  "disgusted",
  "disgusted2",
  "left",
  "positive",
  "positive2",
  "right",
  "sneeze",
  "sneeze2",
  "uncertain",
] as const satisfies readonly BragePoseName[]

export const ANDRE_POSE_NAMES = [
  "enter1",
  "enter2",
  "enter3",
  "idle",
  "curious",
  "positive",
  "disgusted",
  "left",
  "right",
  "skeptical",
  "uncertain",
] as const satisfies readonly AndrePoseName[]

const BRAGE_IDLE_ACTIONS = ["look-around", "sneeze", "uncertain", "curious"] as const
const ANDRE_IDLE_ACTIONS = ["look-around", "uncertain", "curious", "skeptical"] as const
const REACTION_SENTIMENTS = ["positive", "negative"] as const

const ENTER_SEQUENCE: PoseKeyframe[] = [
  { poseName: "enter1", durationMs: ENTER_HAND_FRAME_MS },
  { poseName: "enter2", durationMs: ENTER_HAND_FRAME_MS },
  { poseName: "enter3", durationMs: ENTER_HAND_FRAME_MS },
]

export function DoomFaceFrame({
  face,
  leftHand,
  rightHand,
  className,
  faceClassName,
  leftHandClassName,
  rightHandClassName,
  leftHandZIndexClassName,
  rightHandZIndexClassName,
}: {
  face: ReactNode
  leftHand: ReactNode
  rightHand: ReactNode
  className?: string
  faceClassName?: string
  leftHandClassName?: string
  rightHandClassName?: string
  leftHandZIndexClassName?: string
  rightHandZIndexClassName?: string
}) {
  return (
    <div aria-hidden="true" className={cn("relative h-37.5 w-43.75", className)}>
      <div className={cn("absolute top-16 left-0 z-1", rightHandZIndexClassName, rightHandClassName)}>{rightHand}</div>
      <div className={cn("absolute top-16 right-6 z-1", leftHandZIndexClassName, leftHandClassName)}>{leftHand}</div>
      <div className={cn("absolute top-0 inset-x-0 z-0", faceClassName)}>{face}</div>
    </div>
  )
}

export function DoomFacePose({
  character,
  poseName,
  className,
  faceClassName,
  handsClassName,
  handsZIndexClassName,
}: {
  character: DoomCharacter
  poseName: DoomPoseName
  className?: string
  faceClassName?: string
  handsClassName?: string
  handsZIndexClassName?: string
}) {
  const pose = getPose(character, poseName)

  let leftHand: ReactNode = null
  if (pose.leftHand.src !== null) {
    leftHand = <DoomImage src={pose.leftHand.src} size={HAND_SIZE} />
  }

  let rightHand: ReactNode = null
  if (pose.rightHand.src !== null) {
    rightHand = <DoomImage src={pose.rightHand.src} size={HAND_SIZE} />
  }

  return (
    <DoomFaceFrame
      className={className}
      face={<DoomImage src={pose.faceSrc} size={FACE_SIZE} />}
      faceClassName={faceClassName}
      leftHand={leftHand}
      leftHandClassName={cn(pose.leftHand.className, handsClassName)}
      leftHandZIndexClassName={cn(pose.leftHand.zIndexClassName, handsZIndexClassName)}
      rightHand={rightHand}
      rightHandClassName={cn(pose.rightHand.className, handsClassName)}
      rightHandZIndexClassName={cn(pose.rightHand.zIndexClassName, handsZIndexClassName)}
    />
  )
}

function preventBrowserMenu(event: { preventDefault: () => void }) {
  event.preventDefault()
}

function DoomImage({ src, size }: { src: string; size: number }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      draggable={false}
      unoptimized
      className="pointer-events-none select-none [-webkit-user-drag:none]"
    />
  )
}

export function BirthdayPartyDoomFace({ reactionKey = 0 }: { reactionKey?: number }) {
  const [character, setCharacter] = useState<DoomCharacter | null>(null)
  const [appearanceId, setAppearanceId] = useState(0)
  const hiddenPauseTimeoutRef = useRef<number | null>(null)

  const spawnCharacter = useCallback((previousCharacter: DoomCharacter | null) => {
    const nextCharacter = pickRandomCharacter(previousCharacter)
    setCharacter(nextCharacter)
    setAppearanceId((currentAppearanceId) => currentAppearanceId + 1)
  }, [])

  useEffect(() => {
    spawnCharacter(null)
    preloadAllCharacterImages()

    return () => {
      if (hiddenPauseTimeoutRef.current !== null) {
        window.clearTimeout(hiddenPauseTimeoutRef.current)
      }
    }
  }, [spawnCharacter])

  const handleExitComplete = useCallback(() => {
    const previousCharacter = character
    setCharacter(null)

    hiddenPauseTimeoutRef.current = window.setTimeout(() => {
      spawnCharacter(previousCharacter)
    }, HIDDEN_PAUSE_MS)
  }, [character, spawnCharacter])

  if (character === null) {
    return null
  }

  return (
    <DoomFigure
      key={appearanceId}
      character={character}
      reactionKey={reactionKey}
      onExitComplete={handleExitComplete}
    />
  )
}

function DoomFigure({
  character,
  reactionKey,
  onExitComplete,
}: {
  character: DoomCharacter
  reactionKey: number
  onExitComplete: () => void
}) {
  const [phase, setPhase] = useState<AnimationPhase>("entering")
  const [poseName, setPoseName] = useState<DoomPoseName>("enter1")
  const [isFaceRaised, setIsFaceRaised] = useState(false)
  const [isFigureLowered, setIsFigureLowered] = useState(false)

  const onExitCompleteRef = useRef(onExitComplete)
  const seenReactionKeyRef = useRef(reactionKey)
  const pendingReactionRef = useRef(false)
  const previousIdleActionRef = useRef<string | null>(null)

  onExitCompleteRef.current = onExitComplete

  useEffect(() => {
    if (reactionKey === seenReactionKeyRef.current) {
      return
    }

    seenReactionKeyRef.current = reactionKey

    if (phase === "entering") {
      pendingReactionRef.current = true
      return
    }

    if (phase === "exiting") {
      return
    }

    pendingReactionRef.current = false
    setPhase("reacting")
  }, [phase, reactionKey])

  useEffect(() => {
    if (phase !== "entering") {
      return
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      setIsFaceRaised(true)
      setPoseName("idle")

      if (pendingReactionRef.current) {
        pendingReactionRef.current = false
        setPhase("reacting")
        return
      }

      setPhase("idle")
      return
    }

    const animationFrameIds: number[] = []
    animationFrameIds.push(
      window.requestAnimationFrame(() => {
        animationFrameIds.push(
          window.requestAnimationFrame(() => {
            setIsFaceRaised(true)
          })
        )
      })
    )

    const stopEnterSequence = playPoseSequence(ENTER_SEQUENCE, setPoseName, () => {
      setPoseName("idle")

      if (pendingReactionRef.current) {
        pendingReactionRef.current = false
        setPhase("reacting")
        return
      }

      setPhase("idle")
    })

    return () => {
      for (const animationFrameId of animationFrameIds) {
        window.cancelAnimationFrame(animationFrameId)
      }
      stopEnterSequence()
    }
  }, [phase])

  useEffect(() => {
    if (phase !== "idle") {
      return
    }

    const delayMs = randomIntegerBetween(IDLE_ACTION_MIN_DELAY_MS, IDLE_ACTION_MAX_DELAY_MS)
    const timeout = window.setTimeout(() => {
      setPhase((currentPhase) => {
        if (currentPhase !== "idle") {
          return currentPhase
        }

        return "acting"
      })
    }, delayMs)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== "acting") {
      return
    }

    const idleActions = character === "brage" ? BRAGE_IDLE_ACTIONS : ANDRE_IDLE_ACTIONS
    const actionName = pickRandomAction(idleActions, previousIdleActionRef.current)
    previousIdleActionRef.current = actionName
    const sequence = getIdleActionSequence(actionName)

    return playPoseSequence(sequence, setPoseName, () => {
      setPoseName("idle")
      setPhase((currentPhase) => {
        if (currentPhase !== "acting") {
          return currentPhase
        }

        return "idle"
      })
    })
  }, [character, phase])

  useEffect(() => {
    if (phase !== "reacting") {
      return
    }

    const sentiment = pickRandomItem(REACTION_SENTIMENTS)
    const sequence = getReactionSequence(character, sentiment)

    return playPoseSequence(sequence, setPoseName, () => {
      setPhase("exiting")
    })
  }, [character, phase])

  useEffect(() => {
    if (phase !== "exiting") {
      return
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setIsFigureLowered(true)

    const delayMs = prefersReducedMotion ? 0 : EXIT_SLIDE_MS
    const timeout = window.setTimeout(() => {
      onExitCompleteRef.current()
    }, delayMs)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [phase])

  const poseNames = character === "brage" ? BRAGE_POSE_NAMES : ANDRE_POSE_NAMES
  const figureSlideClassName = cn(SLIDE_TRANSITION_CLASS_NAME, isFigureLowered ? "translate-y-28" : "translate-y-0")
  const faceSlideClassName = cn(
    SLIDE_TRANSITION_CLASS_NAME,
    isFigureLowered ? "translate-y-28" : isFaceRaised ? "translate-y-0" : "translate-y-23"
  )

  let exitingHandZIndexClassName: string | undefined
  if (isFigureLowered) {
    exitingHandZIndexClassName = "z-1"
  }

  return (
    <Link
      href={CHARACTER_PROFILE_HREF[character]}
      aria-label={CHARACTER_PROFILE_LABEL[character]}
      draggable={false}
      onContextMenu={preventBrowserMenu}
      onDragStart={preventBrowserMenu}
      className="relative block h-37.5 w-43.75 cursor-pointer pointer-events-auto select-none"
    >
      {poseNames.map((stackedPoseName) => {
        let visibilityClassName = "absolute inset-0 opacity-0"
        if (stackedPoseName === poseName) {
          visibilityClassName = "absolute inset-0 opacity-100"
        }

        return (
          <div key={stackedPoseName} className={visibilityClassName}>
            <DoomFacePose
              character={character}
              poseName={stackedPoseName}
              faceClassName={faceSlideClassName}
              handsClassName={figureSlideClassName}
              handsZIndexClassName={exitingHandZIndexClassName}
            />
          </div>
        )
      })}
    </Link>
  )
}

function getPose(character: DoomCharacter, poseName: DoomPoseName): DoomPose {
  if (character === "brage") {
    const pose = BRAGE_POSES[poseName as BragePoseName]
    if (pose !== undefined) {
      return pose
    }

    return BRAGE_POSES.idle
  }

  const pose = ANDRE_POSES[poseName as AndrePoseName]
  if (pose !== undefined) {
    return pose
  }

  return ANDRE_POSES.idle
}

function getIdleActionSequence(actionName: string): PoseKeyframe[] {
  if (actionName === "look-around") {
    return [
      { poseName: "left", durationMs: 900 },
      { poseName: "idle", durationMs: 500 },
      { poseName: "right", durationMs: 900 },
      { poseName: "idle", durationMs: 400 },
    ]
  }

  if (actionName === "sneeze") {
    return [
      { poseName: "sneeze", durationMs: 600 },
      { poseName: "sneeze2", durationMs: 900 },
      { poseName: "idle", durationMs: 500 },
    ]
  }

  if (actionName === "curious") {
    return [
      { poseName: "curious", durationMs: 1600 },
      { poseName: "idle", durationMs: 400 },
    ]
  }

  if (actionName === "skeptical") {
    return [
      { poseName: "skeptical", durationMs: 1800 },
      { poseName: "idle", durationMs: 400 },
    ]
  }

  return [
    { poseName: "uncertain", durationMs: 1600 },
    { poseName: "idle", durationMs: 400 },
  ]
}

function getReactionSequence(
  character: DoomCharacter,
  sentiment: (typeof REACTION_SENTIMENTS)[number]
): PoseKeyframe[] {
  if (sentiment === "positive") {
    if (character === "brage") {
      return [
        { poseName: "curious", durationMs: 600 },
        { poseName: "positive", durationMs: 800 },
        { poseName: "positive2", durationMs: 1400 + REACTION_END_HOLD_MS },
      ]
    }

    return [
      { poseName: "curious", durationMs: 700 },
      { poseName: "positive", durationMs: 1600 + REACTION_END_HOLD_MS },
    ]
  }

  if (character === "brage") {
    return [
      { poseName: "uncertain", durationMs: 500 },
      { poseName: "disgusted", durationMs: 800 },
      { poseName: "disgusted2", durationMs: 1200 + REACTION_END_HOLD_MS },
    ]
  }

  return [
    { poseName: "skeptical", durationMs: 700 },
    { poseName: "disgusted", durationMs: 1600 + REACTION_END_HOLD_MS },
  ]
}

function playPoseSequence(
  sequence: readonly PoseKeyframe[],
  onPoseChange: (poseName: DoomPoseName) => void,
  onComplete: () => void
): () => void {
  const timeouts: number[] = []
  let elapsedMs = 0

  for (const keyframe of sequence) {
    const poseName = keyframe.poseName
    timeouts.push(
      window.setTimeout(() => {
        onPoseChange(poseName as DoomPoseName)
      }, elapsedMs)
    )
    elapsedMs += keyframe.durationMs
  }

  timeouts.push(window.setTimeout(onComplete, elapsedMs))

  return () => {
    for (const timeout of timeouts) {
      window.clearTimeout(timeout)
    }
  }
}

function pickRandomCharacter(previousCharacter: DoomCharacter | null): DoomCharacter {
  if (previousCharacter === null) {
    return pickRandomItem(DOOM_CHARACTERS)
  }

  const otherCharacters = DOOM_CHARACTERS.filter((character) => character !== previousCharacter)
  return pickRandomItem(otherCharacters)
}

function pickRandomAction(actions: readonly string[], previousAction: string | null): string {
  if (previousAction === null) {
    return pickRandomItem(actions)
  }

  const otherActions = actions.filter((action) => action !== previousAction)
  if (otherActions.length === 0) {
    return pickRandomItem(actions)
  }

  return pickRandomItem(otherActions)
}

function pickRandomItem<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty list")
  }

  const index = Math.floor(Math.random() * items.length)
  return items[index] as T
}

function randomIntegerBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function preloadAllCharacterImages() {
  const sources = new Set<string>()

  for (const pose of Object.values(BRAGE_POSES)) {
    collectPoseSources(pose, sources)
  }

  for (const pose of Object.values(ANDRE_POSES)) {
    collectPoseSources(pose, sources)
  }

  for (const source of sources) {
    const image = new window.Image()
    image.src = source
  }
}

function collectPoseSources(pose: DoomPose, sources: Set<string>) {
  sources.add(pose.faceSrc)

  if (pose.leftHand.src !== null) {
    sources.add(pose.leftHand.src)
  }

  if (pose.rightHand.src !== null) {
    sources.add(pose.rightHand.src)
  }
}
