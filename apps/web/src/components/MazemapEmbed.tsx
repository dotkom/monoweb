"use client"

import { Button } from "@dotkomonline/ui"
import { IconArrowUpRight } from "@tabler/icons-react"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"

const MAZEMAP_SDK_URL = "https://api.mazemap.com/js/v3.0.9"

type Room = { properties: { zLevel: number; campusId?: number }; geometry: { type: string } }
type Coordinates = { lng: number; lat: number }
type PreviewMap = {
  on(event: string, callback: () => void): void
  resize(): void
  remove(): void
}

// Only the SDK surface used by this read-only preview.
type MazemapSdk = {
  Data: { getPoi(id: number): Promise<Room> }
  Util: { getPoiLngLat(room: Room): Coordinates }
  Map: new (options: {
    campuses: number
    container: HTMLElement
    center: Coordinates
    zoom: number
    zLevel: number
    zLevelControl: boolean
    interactive: boolean
  }) => PreviewMap
  Highlighter: new (
    map: PreviewMap,
    options: { showOutline: boolean; showFill: boolean }
  ) => { highlight(room: Room): void }
  MazeMarker: new (options: {
    color: string
    zLevel: number
  }) => {
    setLngLat(coordinates: Coordinates): { addTo(map: PreviewMap): void }
  }
}

function RoomPreview({ poiId, campusId, title }: { poiId: string; campusId: number | null; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSdkReady, setIsSdkReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const sdk = (window as Window & { Mazemap?: MazemapSdk }).Mazemap

    if (!isSdkReady || container === null || sdk === undefined) {
      return
    }

    setIsLoading(true)
    setHasError(false)
    const loadingTimeout = window.setTimeout(() => {
      setHasError(true)
    }, 20_000)
    let isDisposed = false
    let map: PreviewMap | null = null
    const resizeObserver = new ResizeObserver(() => {
      map?.resize()
    })
    resizeObserver.observe(container)

    async function initializeMap(sdk: MazemapSdk, container: HTMLElement) {
      try {
        const room = await sdk.Data.getPoi(Number(poiId))

        if (isDisposed) {
          return
        }

        const resolvedCampusId = campusId ?? room.properties.campusId

        if (resolvedCampusId === undefined || !Number.isSafeInteger(resolvedCampusId) || resolvedCampusId <= 0) {
          throw new Error("The room has no valid campus ID")
        }

        const center = sdk.Util.getPoiLngLat(room)
        const previewMap = new sdk.Map({
          campuses: resolvedCampusId,
          container,
          center,
          zoom: 18,
          zLevel: room.properties.zLevel,
          zLevelControl: false,
          interactive: false,
        })
        map = previewMap
        previewMap.on("load", () => {
          if (isDisposed) {
            return
          }

          if (room.geometry.type === "Polygon" || room.geometry.type === "MultiPolygon") {
            new sdk.Highlighter(previewMap, { showOutline: true, showFill: true }).highlight(room)
          } else {
            new sdk.MazeMarker({ color: "#2563eb", zLevel: room.properties.zLevel }).setLngLat(center).addTo(previewMap)
          }

          window.clearTimeout(loadingTimeout)
          setHasError(false)
          setIsLoading(false)
        })
      } catch {
        if (!isDisposed) {
          window.clearTimeout(loadingTimeout)
          setHasError(true)
        }
      }
    }

    void initializeMap(sdk, container)

    return () => {
      isDisposed = true
      window.clearTimeout(loadingTimeout)
      resizeObserver.disconnect()
      map?.remove()
    }
  }, [isSdkReady, poiId, campusId])

  return (
    <>
      <link rel="stylesheet" href={`${MAZEMAP_SDK_URL}/mazemap.min.css`} />
      <Script
        src={`${MAZEMAP_SDK_URL}/mazemap.min.js`}
        onReady={() => setIsSdkReady(true)}
        onError={() => setHasError(true)}
      />
      <div
        className="relative h-full min-h-0 w-full overflow-hidden rounded-xl border border-border bg-muted"
        role="img"
        aria-label={title}
      >
        {/* MazeMap sets position: relative outside Tailwind's layers, so use explicit dimensions. */}
        <div ref={containerRef} className="h-full w-full" />
        {(isLoading || hasError) && (
          <p
            role="status"
            className="absolute inset-0 m-0 flex items-center justify-center bg-muted p-4 text-center text-sm text-muted-foreground"
          >
            {hasError ? "Kunne ikke laste kartet. Bruk lenken til veibeskrivelsen." : "Laster kart…"}
          </p>
        )}
      </div>
    </>
  )
}

export function MazemapEmbed({ url, title }: { url: string | null; title: string }) {
  if (url === null) {
    return null
  }

  let location: URL

  try {
    location = new URL(url)
  } catch {
    return null
  }

  if (location.origin !== "https://use.mazemap.com" || location.pathname !== "/") {
    return null
  }

  const parameters = new URLSearchParams(location.search)
  const hashParameters = new URLSearchParams(location.hash.slice(1))

  for (const [key, value] of hashParameters) {
    parameters.set(key, value)
  }

  const poiId = parameters.get("sharepoi") ?? parameters.get("dest")
  const poiType = parameters.get("sharepoitype") ?? parameters.get("desttype")

  if (poiType !== "poi" || poiId === null || !/^\d+$/.test(poiId)) {
    return (
      <a href={location.href} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">
        Åpne kart i MazeMap
      </a>
    )
  }

  const campusParameter = parameters.get("campusid")
  const campusId = campusParameter !== null && /^\d+$/.test(campusParameter) ? Number(campusParameter) : null

  const directionsLocation = new URL("https://use.mazemap.com/")
  directionsLocation.searchParams.set("desttype", "poi")
  directionsLocation.searchParams.set("dest", poiId)
  return (
    <div className="grid aspect-square w-full max-w-xs grid-rows-[minmax(0,1fr)_4rem] gap-3">
      <RoomPreview key={`${poiId}:${campusId}`} poiId={poiId} campusId={campusId} title={title} />
      <Button
        element="a"
        variant="default"
        href={directionsLocation.href}
        target="_blank"
        rel="noreferrer"
        className="min-h-16 w-full text-base"
      >
        Veibeskrivelse
        <IconArrowUpRight className="size-5" aria-hidden="true" />
      </Button>
    </div>
  )
}
