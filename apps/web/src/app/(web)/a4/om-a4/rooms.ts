import type { MazeMapPolygonGeometry } from "../components/mazemap"

type MercatorPoint = [number, number]

type RoomConfig = {
  name: string
  code: string
  // Highlight the group as one continuous rectangle instead of one outline per room
  merged?: boolean
} & (
  | { identifiers: readonly string[] }
  | {
      // Hand-drawn area in Web Mercator coordinates, for locations without their own POI
      area: readonly MercatorPoint[]
      zLevel: number
      buildingName: string
    }
)

export interface KontoretRoom {
  name: string
  code: string
  buildingName: string
  poiIds: number[]
  highlightGeometry?: MazeMapPolygonGeometry
  center: { lng: number; lat: number }
  zLevel: number
}

interface MazeMapPoi {
  poiId: number
  identifier: string
  buildingName: string
  geometry: MazeMapPolygonGeometry
  point: { coordinates: [number, number] }
  z: number
}

export const CAMPUS_ID = 1
export const MAP_ZOOM = 18.5

const ROOMS = [
  { name: "Kontoret", code: "A4-137", identifiers: ["360-A4-137"] },
  { name: "Tihlderommet", code: "A4-112", identifiers: ["360-A4-112"] },
  { name: "Objektrommet", code: "A4-156", identifiers: ["360-A4-156"] },
  { name: "Utsikten", code: "A4-124", identifiers: ["360-A4-124"] },
  {
    name: "Masterrommene",
    code: "Flere rom",
    identifiers: ["360-A4-119", "360-A4-121", "360-A4-125", "360-A4-129", "360-A4-131"],
    merged: true,
  },
  { name: "Webdevrommet", code: "A4-100", identifiers: ["360-A4-100"] },
  {
    name: "Grupperom store",
    code: "Flere rom på sidene",
    identifiers: ["360-A4-132", "360-A4-134", "360-A4-138"],
    merged: true,
  },
  { name: "Grupperom små", code: "Flere rom ved kontoret", identifiers: ["360-A4-145", "360-A4-147"], merged: true },
  { name: "Heiser", code: "Heisene", identifiers: ["360-A4-001A", "360-A4-001B"] },
  {
    name: "Toaletter",
    code: "Flere rom i hjørnet",
    area: [
      [1158243.0, 9202910.74],
      [1158248.64, 9202913.39],
      [1158254.59, 9202900.75],
      [1158243.56, 9202895.56],
      [1158241.46, 9202900.03],
      [1158246.85, 9202902.57],
    ],
    zLevel: 4,
    buildingName: "Realfagbygget",
  },
  {
    name: "Kaffehjørnet",
    code: "I korridoren",
    area: [
      [1158234.36, 9202906.01],
      [1158239.04, 9202908.15],
      [1158240.79, 9202904.42],
      [1158236.11, 9202902.28],
    ],
    zLevel: 4,
    buildingName: "Realfagbygget",
  },
] satisfies readonly RoomConfig[]

const EARTH_RADIUS_METERS = 6_378_137

const mercatorToLngLat = ([x, y]: [number, number]) => ({
  lng: (x / EARTH_RADIUS_METERS) * (180 / Math.PI),
  lat: (2 * Math.atan(Math.exp(y / EARTH_RADIUS_METERS)) - Math.PI / 2) * (180 / Math.PI),
})

const rotatePoint = ([x, y]: number[], angle: number): MercatorPoint => [
  x * Math.cos(angle) - y * Math.sin(angle),
  x * Math.sin(angle) + y * Math.cos(angle),
]

const getRowRectangle = (pois: MazeMapPoi[]): MazeMapPolygonGeometry => {
  const rings = pois.map((poi) => poi.geometry.coordinates?.[0] ?? [])
  const first = pois[0].point.coordinates
  const last = pois.at(-1)?.point.coordinates ?? first
  const rowAngle = -Math.atan2(last[1] - first[1], last[0] - first[0])

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const ring of rings) {
    for (const point of ring) {
      const [x, y] = rotatePoint(point, rowAngle)

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  const corners = (
    [
      [minX, minY],
      [maxX, minY],
      [maxX, maxY],
      [minX, maxY],
    ] as MercatorPoint[]
  ).map((point) => rotatePoint(point, -rowAngle))

  const ring = [...corners, corners[0]].map(([x, y]) => {
    const { lng, lat } = mercatorToLngLat([x, y])
    return [lng, lat]
  })

  return { type: "Polygon", coordinates: [ring] }
}

const fetchPoiByIdentifier = async (identifier: string): Promise<MazeMapPoi | null> => {
  const response = await fetch(`https://api.mazemap.com/api/pois/?campusid=${CAMPUS_ID}&identifier=${identifier}`, {
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    return null
  }

  const data: { pois: MazeMapPoi[] } = await response.json()
  return data.pois[0] ?? null
}

const fetchRoom = async (room: RoomConfig): Promise<KontoretRoom | null> => {
  if ("area" in room) {
    const [sumX, sumY] = room.area.reduce<MercatorPoint>(([x, y], [pointX, pointY]) => [x + pointX, y + pointY], [0, 0])
    const ring = [...room.area, room.area[0]].map(([x, y]) => {
      const { lng, lat } = mercatorToLngLat([x, y])
      return [lng, lat]
    })

    return {
      name: room.name,
      code: room.code,
      buildingName: room.buildingName,
      poiIds: [],
      highlightGeometry: { type: "Polygon", coordinates: [ring] },
      center: mercatorToLngLat([sumX / room.area.length, sumY / room.area.length]),
      zLevel: room.zLevel,
    }
  }

  const pois = (await Promise.all(room.identifiers.map(fetchPoiByIdentifier))).filter(
    (poi): poi is MazeMapPoi => poi !== null
  )

  if (pois.length === 0) {
    return null
  }

  const [sumX, sumY] = pois.reduce(
    ([x, y], poi) => [x + poi.point.coordinates[0], y + poi.point.coordinates[1]],
    [0, 0]
  )

  // Groups configured with 'merged' are highlighted as one continuous rectangle covering the row
  const isRoomGroup = room.merged === true && pois.length > 1

  return {
    name: room.name,
    code: room.code,
    buildingName: pois[0].buildingName,
    poiIds: pois.map((poi) => poi.poiId),
    highlightGeometry: isRoomGroup ? getRowRectangle(pois) : undefined,
    center: mercatorToLngLat([sumX / pois.length, sumY / pois.length]),
    zLevel: pois[0].z,
  }
}

export const getKontoretRooms = async (): Promise<KontoretRoom[]> => {
  const rooms = await Promise.all(ROOMS.map(fetchRoom))
  return rooms.filter((room): room is KontoretRoom => room !== null)
}
