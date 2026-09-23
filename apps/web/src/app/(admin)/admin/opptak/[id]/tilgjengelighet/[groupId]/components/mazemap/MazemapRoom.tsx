"use client"

import { useTRPC } from "@admin/lib/trpc-client"
import { hasValidMazemapRoom, type MazemapRoom as Room } from "@dotkomonline/rpc/mazemap"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  FieldError,
  Text,
} from "@dotkomonline/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { hoursToMilliseconds } from "date-fns"
import { useEffect, useRef, useState } from "react"
import { useDebounce } from "use-debounce"

const DEBOUNCE_MILLISECONDS = 250
const TYPING_REASONS: string[] = ["input-change", "input-paste", "input-clear"]

interface MazemapRoomProps {
  room: string
  link: string
  onSelect: (room: string, link: string) => void
  onRoomChange: (room: string) => void
}

export const MazemapRoom = ({ room, link, onSelect, onRoomChange }: MazemapRoomProps) => {
  const trpc = useTRPC()
  const [isOpen, setIsOpen] = useState(false)
  const [query] = useDebounce(room.trim(), DEBOUNCE_MILLISECONDS)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data, isFetching } = useQuery(
    trpc.mazemap.searchRooms.queryOptions(
      { query },
      { enabled: query !== "", staleTime: hoursToMilliseconds(1), placeholderData: keepPreviousData }
    )
  )

  useEffect(() => {
    const container = containerRef.current

    if (container === null) {
      return
    }

    const stopPropagation = (event: Event) => {
      event.stopPropagation()
    }

    container.addEventListener("pointerdown", stopPropagation)
    container.addEventListener("mousedown", stopPropagation)

    return () => {
      container.removeEventListener("pointerdown", stopPropagation)
      container.removeEventListener("mousedown", stopPropagation)
    }
  }, [])

  const showsInvalid = room.trim() !== "" && !isOpen && !hasValidMazemapRoom(room, link)

  return (
    <div ref={containerRef} data-slot="mazemap-room" className="flex min-h-0 flex-1 flex-col gap-1.5">
      <Combobox
        open={isOpen}
        onOpenChange={setIsOpen}
        items={data ?? []}
        value={null}
        onValueChange={(selected: Room | null) => {
          if (selected === null) {
            return
          }

          onSelect(selected.name, selected.link)
          setIsOpen(false)
        }}
        inputValue={room}
        onInputValueChange={(next, eventDetails) => {
          if (!TYPING_REASONS.includes(eventDetails.reason)) {
            return
          }

          onRoomChange(next)
          setIsOpen(true)
        }}
        filter={null}
        itemToStringLabel={(candidate: Room) => candidate.name}
        isItemEqualToValue={(a: Room, b: Room) => a.poiId === b.poiId}
        autoHighlight
      >
        <ComboboxInput
          aria-label="Rom"
          aria-invalid={showsInvalid || undefined}
          placeholder="Søk etter rom"
          showTrigger={false}
          className="h-8 [&_input[aria-invalid]]:border-0 [&_input[aria-invalid]]:ring-0"
        />
        <ComboboxContent className="slot-popup">
          <ComboboxEmpty>{isFetching ? "Søker i Mazemap…" : "Ingen rom funnet"}</ComboboxEmpty>
          <ComboboxList>
            {(candidate: Room) => {
              const details = [candidate.building, candidate.floor].filter((part) => part !== null).join(" · ")

              return (
                <ComboboxItem key={candidate.poiId} value={candidate} className="flex-col items-start gap-0.5">
                  <Text element="span" className="w-full truncate text-xs font-medium leading-none">
                    {candidate.name}
                  </Text>
                  {details !== "" && (
                    <Text element="span" className="w-full truncate text-xs leading-none opacity-55">
                      {details}
                    </Text>
                  )}
                </ComboboxItem>
              )
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {showsInvalid && <FieldError className="text-xs">Velg et rom fra listen</FieldError>}
    </div>
  )
}
