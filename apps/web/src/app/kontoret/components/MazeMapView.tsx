"use client"

import type { FC } from "react"
import { useEffect, useRef, useState } from "react"
import {
  type LngLat,
  loadMazemap,
  type MazeMapGlobal,
  type MazeMapHighlighterInstance,
  type MazeMapInstance,
  type MazeMapPolygonGeometry,
  MAZEMAP_HIGHLIGHT_COLOR,
  MAZEMAP_HOVER_HIGHLIGHT_COLOR,
} from "./mazemap"

export interface MazeMapRoom {
  poiIds: number[]
  highlightGeometry?: MazeMapPolygonGeometry
  zLevel: number
}

interface MazeMapViewProps {
  room: MazeMapRoom
  hoveredRoom?: MazeMapRoom
  campusId: number
  center: LngLat
  zoom: number
  className?: string
}

const applyHighlight = (
  highlighter: MazeMapHighlighterInstance,
  room: MazeMapRoom,
  Mazemap: MazeMapGlobal,
  isCancelled: () => boolean
) => {
  highlighter.clear()

  if (room.highlightGeometry) {
    highlighter.highlight({
      type: "Feature",
      geometry: room.highlightGeometry,
      properties: { zLevel: room.zLevel },
    })

    return
  }

  if (room.poiIds.length === 0) {
    return
  }

  Promise.all(room.poiIds.map((poiId) => Mazemap.Data.getPoi(poiId)))
    .then((pois) => {
      if (isCancelled()) {
        return
      }

      const polygons = pois.filter((poi) => poi.geometry?.type === "Polygon")

      if (polygons.length > 0) {
        highlighter.highlight({ type: "FeatureCollection", features: polygons })
      }
    })
    .catch(() => undefined)
}

export const MazeMapView: FC<MazeMapViewProps> = ({ room, hoveredRoom, campusId, center, zoom, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MazeMapInstance | null>(null)
  const mazemapRef = useRef<MazeMapGlobal | null>(null)
  const selectedHighlighterRef = useRef<MazeMapHighlighterInstance | null>(null)
  const hoverHighlighterRef = useRef<MazeMapHighlighterInstance | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: the map should only use the initial viewport as its start position
  useEffect(() => {
    let cancelled = false

    loadMazemap()
      .then((Mazemap) => {
        if (cancelled || !containerRef.current) {
          return
        }

        mazemapRef.current = Mazemap

        const map = new Mazemap.Map({
          container: containerRef.current,
          campuses: campusId,
          center,
          zoom,
          zLevel: room.zLevel,
        })
        mapRef.current = map

        map.on("load", () => {
          if (cancelled) {
            return
          }

          selectedHighlighterRef.current = new Mazemap.Highlighter(map, {
            showOutline: true,
            showFill: true,
            outlineColor: MAZEMAP_HIGHLIGHT_COLOR,
            fillColor: MAZEMAP_HIGHLIGHT_COLOR,
          })
          hoverHighlighterRef.current = new Mazemap.Highlighter(map, {
            id: "mm-hover-highlight",
            showOutline: true,
            showFill: true,
            outlineColor: MAZEMAP_HOVER_HIGHLIGHT_COLOR,
            fillColor: MAZEMAP_HOVER_HIGHLIGHT_COLOR,
          })
          setReady(true)
        })
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
        }
      })

    return () => {
      cancelled = true
      selectedHighlighterRef.current = null
      hoverHighlighterRef.current = null
      mazemapRef.current = null
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!ready) {
      return
    }

    mapRef.current?.flyTo({ center, zoom })
  }, [ready, center, zoom])

  useEffect(() => {
    const highlighter = selectedHighlighterRef.current
    const Mazemap = mazemapRef.current

    if (!ready || !highlighter || !Mazemap) {
      return
    }

    let cancelled = false
    applyHighlight(highlighter, room, Mazemap, () => cancelled)

    return () => {
      cancelled = true
    }
  }, [ready, room])

  useEffect(() => {
    const highlighter = hoverHighlighterRef.current
    const Mazemap = mazemapRef.current

    if (!ready || !highlighter || !Mazemap) {
      return
    }

    if (!hoveredRoom || hoveredRoom === room) {
      highlighter.clear()

      return
    }

    let cancelled = false
    applyHighlight(highlighter, hoveredRoom, Mazemap, () => cancelled)

    return () => {
      cancelled = true
    }
  }, [ready, room, hoveredRoom])

  if (failed) {
    return (
      <div className={className}>
        <p className="p-4 text-gray-600 dark:text-stone-300">Klarte ikke å laste kartet. Prøv igjen senere.</p>
      </div>
    )
  }

  return <div ref={containerRef} className={className} />
}
