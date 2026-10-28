"use client"

import { cn, Text, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import type { FC } from "react"
import { useState } from "react"
import type { KontoretRoom } from "../om-kontoret/rooms"
import { MazeMapView } from "./MazeMapView"

interface KontoretMapProps {
  rooms: KontoretRoom[]
  campusId: number
  zoom: number
  className?: string
}

export const KontoretMap: FC<KontoretMapProps> = ({ rooms, campusId, zoom, className }) => {
  const [selectedCode, setSelectedCode] = useState(rooms.at(0)?.code ?? "")
  const room = rooms.find((candidate) => candidate.code === selectedCode) ?? rooms[0]

  if (!room) {
    return null
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ToggleGroup
        multiple={false}
        spacing={1}
        value={[room.code]}
        onValueChange={(value) => {
          const nextCode = value.at(0)

          if (nextCode) {
            setSelectedCode(nextCode)
          }
        }}
        className="w-full flex-wrap"
      >
        {rooms.map((roomOption) => (
          <ToggleGroupItem key={roomOption.code} value={roomOption.code} className="flex flex-row items-center gap-2">
            <Text element="span">{roomOption.name}</Text>
            <Text element="span" className="text-gray-500 dark:text-stone-400">
              {roomOption.code}
            </Text>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <MazeMapView
        poiIds={room.poiIds}
        highlightGeometry={room.highlightGeometry}
        campusId={campusId}
        center={room.center}
        zoom={zoom}
        zLevel={room.zLevel}
        className="h-80 w-full overflow-hidden rounded-xl md:h-[32rem]"
      />
    </div>
  )
}
