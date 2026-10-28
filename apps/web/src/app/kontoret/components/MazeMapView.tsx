"use client"

import type { FC } from "react"
import { useEffect, useRef, useState } from "react"
import {
  getLngLatCenter,
  type LngLat,
  loadMazemap,
  type MazeMapGlobal,
  type MazeMapHighlighterInstance,
  type MazeMapInstance,
  type MazeMapPolygonGeometry,
  MAZEMAP_HIGHLIGHT_COLOR,
} from "./mazemap"

interface MazeMapViewProps {
  poiIds: number[]
  highlightGeometry?: MazeMapPolygonGeometry
  campusId: number
  center: LngLat
  zoom: number
  zLevel: number
  className?: string
}

export const MazeMapView: FC<MazeMapViewProps> = ({
  poiIds,
  highlightGeometry,
  campusId,
  center,
  zoom,
  zLevel,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MazeMapInstance | null>(null)
  const mazemapRef = useRef<MazeMapGlobal | null>(null)
  const highlighterRef = useRef<MazeMapHighlighterInstance | null>(null)
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
          zLevel,
        })
        mapRef.current = map

        map.on("load", () => {
          if (cancelled) {
            return
          }

          highlighterRef.current = new Mazemap.Highlighter(map, {
            showOutline: true,
            showFill: true,
            outlineColor: MAZEMAP_HIGHLIGHT_COLOR,
            fillColor: MAZEMAP_HIGHLIGHT_COLOR,
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
      highlighterRef.current = null
      mazemapRef.current = null
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const Mazemap = mazemapRef.current
    const highlighter = highlighterRef.current

    if (!ready || !map || !Mazemap || !highlighter) {
      return
    }

    let cancelled = false

    highlighter.clear()

    if (highlightGeometry) {
      highlighter.highlight({ type: "Feature", geometry: highlightGeometry, properties: { zLevel } })
      map.flyTo({ center, zoom })

      return () => {
        cancelled = true
      }
    }

    if (poiIds.length === 0) {
      return
    }

    Promise.all(poiIds.map((poiId) => Mazemap.Data.getPoi(poiId)))
      .then((pois) => {
        if (cancelled || !map || !Mazemap || !highlighter) {
          return
        }

        const polygons = pois.filter((poi) => poi.geometry?.type === "Polygon")

        if (polygons.length > 0) {
          highlighter.highlight({ type: "FeatureCollection", features: polygons })
        }

        map.flyTo({ center: getLngLatCenter(pois.map((poi) => Mazemap.Util.getPoiLngLat(poi))), zoom })
      })
      .catch(() => {
        if (!cancelled) {
          map.flyTo({ center, zoom })
        }
      })

    return () => {
      cancelled = true
    }
  }, [ready, center, highlightGeometry, poiIds, zLevel, zoom])

  if (failed) {
    return (
      <div className={className}>
        <p className="p-4 text-gray-600 dark:text-stone-300">Klarte ikke å laste kartet. Prøv igjen senere.</p>
      </div>
    )
  }

  return <div ref={containerRef} className={className} />
}
