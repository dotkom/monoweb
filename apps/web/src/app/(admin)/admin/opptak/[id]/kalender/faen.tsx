"use client"

import { IconX } from "@tabler/icons-react"
import type { KeyboardEvent, MouseEvent } from "react"

export interface InterviewSlot {
  id: string
  start: string
  end: string
  room: string
  link: string
}

const MINIMUM_INLINE_FIELD_MINUTES = 40

const FIELD_CLASS_NAME =
  "w-full truncate rounded-md border border-current/15 bg-white/60 px-2 py-1 text-sm text-inherit outline-none transition-colors placeholder:text-inherit placeholder:opacity-50 hover:bg-white focus:border-current/40 focus:bg-white"

function stopDrag(event: MouseEvent) {
  event.stopPropagation()
}

function blurOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter") {
    event.currentTarget.blur()
  }
}

interface SlotContentProps {
  slot: InterviewSlot
  timeText: string
  onUpdate: (patch: Partial<InterviewSlot>) => void
  onRemove: () => void
}

export function SlotContent({ slot, timeText, onUpdate, onRemove }: SlotContentProps) {
  const durationMinutes = (new Date(slot.end).getTime() - new Date(slot.start).getTime()) / 60_000
  const showInlineFields = durationMinutes >= MINIMUM_INLINE_FIELD_MINUTES

  return (
    <div className="flex h-full w-full flex-col gap-1 overflow-hidden px-1.5 py-1">
      <div className="flex shrink-0 items-center justify-between gap-1">
        <span className="min-w-0 truncate text-xs font-medium leading-none">{timeText}</span>

        <button
          type="button"
          aria-label="Fjern intervjutid"
          className="flex size-4 shrink-0 cursor-pointer items-center justify-center opacity-60 transition-opacity hover:opacity-100"
          onMouseDown={stopDrag}
          onClick={onRemove}
        >
          <IconX className="size-3.5" />
        </button>
      </div>

      {showInlineFields && (
        <>
          <input
            key={`room-${slot.room}`}
            type="text"
            aria-label="Rom"
            placeholder="Rom"
            defaultValue={slot.room}
            className={FIELD_CLASS_NAME}
            onMouseDown={stopDrag}
            onKeyDown={blurOnEnter}
            onBlur={(event) => onUpdate({ room: event.target.value.trim() })}
          />
          <input
            key={`link-${slot.link}`}
            type="url"
            inputMode="url"
            aria-label="Mazemap-lenke"
            placeholder="Mazemap-lenke"
            defaultValue={slot.link}
            className={`${FIELD_CLASS_NAME} not-placeholder-shown:underline`}
            onMouseDown={stopDrag}
            onKeyDown={blurOnEnter}
            onBlur={(event) => onUpdate({ link: event.target.value.trim() })}
          />
        </>
      )}
    </div>
  )
}
