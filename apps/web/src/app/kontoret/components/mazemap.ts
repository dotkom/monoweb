export type LngLat = { lng: number; lat: number }

export type MazeMapPolygonGeometry = {
  type?: string
  coordinates?: number[][][]
}

export type MazeMapPoi = {
  geometry?: MazeMapPolygonGeometry
  properties?: { zLevel?: number }
  [key: string]: unknown
}

export type MazeMapInstance = {
  on: (event: string, handler: () => void) => void
  flyTo: (options: { center: LngLat; zoom?: number }) => void
  remove: () => void
}

export type MazeMapFeature = {
  type: "Feature"
  geometry: MazeMapPolygonGeometry
  properties: { zLevel?: number }
}

export type MazeMapFeatureCollection = {
  type: "FeatureCollection"
  features: MazeMapPoi[]
}

export type MazeMapHighlighterInstance = {
  highlight: (geojson: MazeMapPoi | MazeMapFeature | MazeMapFeatureCollection) => void
  clear: () => void
}

export type MazeMapOptions = {
  container: HTMLElement
  campuses: number
  center: LngLat
  zoom: number
  zLevel: number
}

export type MazeMapGlobal = {
  Map: new (options: MazeMapOptions) => MazeMapInstance
  Highlighter: new (
    map: MazeMapInstance,
    options: {
      showOutline: boolean
      showFill: boolean
      outlineColor: string
      fillColor: string
    }
  ) => MazeMapHighlighterInstance
  Util: {
    getPoiLngLat: (poi: MazeMapPoi) => LngLat
  }
  Data: {
    getPoi: (poiId: number) => Promise<MazeMapPoi>
  }
}

declare global {
  interface Window {
    Mazemap?: MazeMapGlobal
  }
}

const MAZEMAP_JS_URL = "https://api.mazemap.com/js/v3.0.9/mazemap.min.js"
const MAZEMAP_CSS_URL = "https://api.mazemap.com/js/v3.0.9/mazemap.min.css"

export const MAZEMAP_HIGHLIGHT_COLOR = "#0b5374"

let mazemapPromise: Promise<MazeMapGlobal> | undefined

export const getLngLatCenter = (lngLats: LngLat[]): LngLat => {
  const [sumLng, sumLat] = lngLats.reduce(([lng, lat], current) => [lng + current.lng, lat + current.lat], [0, 0])

  return { lng: sumLng / lngLats.length, lat: sumLat / lngLats.length }
}

const injectStylesheet = () => {
  if (document.querySelector(`link[href="${MAZEMAP_CSS_URL}"]`)) {
    return
  }

  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = MAZEMAP_CSS_URL
  document.head.appendChild(link)
}

export const loadMazemap = (): Promise<MazeMapGlobal> => {
  if (window.Mazemap) {
    return Promise.resolve(window.Mazemap)
  }

  if (!mazemapPromise) {
    mazemapPromise = new Promise<MazeMapGlobal>((resolve, reject) => {
      injectStylesheet()

      const script = document.createElement("script")
      script.src = MAZEMAP_JS_URL
      script.async = true

      script.onload = () => {
        if (window.Mazemap) {
          resolve(window.Mazemap)
        } else {
          reject(new Error("MazeMap JS API loaded, but the global object is missing"))
        }
      }
      script.onerror = () => reject(new Error("Failed to load the MazeMap JS API"))

      document.head.appendChild(script)
    })

    mazemapPromise.catch(() => {
      mazemapPromise = undefined
    })
  }

  return mazemapPromise
}
