"use client"

import { Button, Text } from "@dotkomonline/ui"
import { type ReactNode, useState } from "react"
import {
  ANDRE_POSE_NAMES,
  type AndrePoseName,
  BirthdayPartyDoomFace,
  BRAGE_POSE_NAMES,
  type BragePoseName,
  DoomFacePose,
} from "./birthday-party-doom-face"

export default {
  title: "Birthday Party Doom Face",
}

const BRAGE_POSE_LABELS: Record<BragePoseName, string> = {
  enter1: "Enter 1",
  enter2: "Enter 2",
  enter3: "Enter 3",
  idle: "Default",
  curious: "Curious",
  disgusted: "Disgusted",
  disgusted2: "Disgusted 2",
  left: "Left",
  positive: "Positive",
  positive2: "Positive 2",
  right: "Right",
  sneeze: "Sneeze",
  sneeze2: "Sneeze 2",
  uncertain: "Uncertain",
}

const ANDRE_POSE_LABELS: Record<AndrePoseName, string> = {
  enter1: "Enter 1",
  enter2: "Enter 2",
  enter3: "Enter 3",
  idle: "Default",
  curious: "Curious",
  positive: "Positive",
  disgusted: "Disgusted",
  left: "Left",
  right: "Right",
  skeptical: "Skeptical",
  uncertain: "Uncertain",
}

function FramePreview({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <div className="relative max-w-md mt-22">
        <div className="absolute -top-22 right-0">{children}</div>
        <div className="relative z-1 min-h-32 p-4 bg-background rounded-sm" />
      </div>
    </div>
  )
}

export const Animated = () => {
  const [reactionKey, setReactionKey] = useState(0)

  const triggerReaction = () => {
    setReactionKey((currentKey) => currentKey + 1)
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="relative mt-22">
        <div className="absolute -top-22 right-0">
          <BirthdayPartyDoomFace reactionKey={reactionKey} />
        </div>
        <div className="relative z-1 min-h-32 p-4 bg-background rounded-sm">
          <Button type="button" variant="default" onClick={triggerReaction}>
            Send inn
          </Button>
        </div>
      </div>
      <Text className="text-sm text-muted-foreground">
        The figure enters, idles, and reacts when you submit. After the reaction it leaves and a new one pops up.
      </Text>
    </div>
  )
}

export const Brage = () => (
  <div className="flex flex-col gap-16">
    {BRAGE_POSE_NAMES.map((poseName) => (
      <FramePreview key={poseName} label={BRAGE_POSE_LABELS[poseName]}>
        <DoomFacePose character="brage" poseName={poseName} />
      </FramePreview>
    ))}
  </div>
)

export const Andre = () => (
  <div className="flex flex-col gap-16">
    {ANDRE_POSE_NAMES.map((poseName) => (
      <FramePreview key={poseName} label={ANDRE_POSE_LABELS[poseName]}>
        <DoomFacePose character="andre" poseName={poseName} />
      </FramePreview>
    ))}
  </div>
)
