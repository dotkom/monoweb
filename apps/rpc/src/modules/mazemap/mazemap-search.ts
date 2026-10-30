import { hoursToMilliseconds } from "date-fns"
import { LRUCache } from "lru-cache"
import { InternalServerError } from "../../error"
import { buildMazemapLink, MAZEMAP_CAMPUS_ID, type MazemapRoom } from "./mazemap"

const SEARCH_ENDPOINT = "https://search.mazemap.com/search/equery/"
const MAXIMUM_RESULTS = 8

interface MazemapSearchHit {
  poiId?: number
  campusId?: number
  dispPoiNames?: string[]
  dispBldNames?: string[]
  flrName?: string
  title?: string
}

function stripHighlightMarkup(value: string | undefined) {
  return value?.replace(/<[^>]*>/g, "").trim()
}

function toRoom(hit: MazemapSearchHit): MazemapRoom | null {
  const poiId = hit.poiId
  const name = stripHighlightMarkup(hit.dispPoiNames?.at(0) ?? hit.title)

  if (poiId === undefined || name === undefined || name === "") {
    return null
  }

  const campusId = hit.campusId ?? MAZEMAP_CAMPUS_ID
  const building = stripHighlightMarkup(hit.dispBldNames?.at(0))

  return {
    poiId,
    campusId,
    name,
    building: building === undefined || building === "" ? null : building,
    floor: stripHighlightMarkup(hit.flrName) ?? null,
    link: buildMazemapLink(campusId, poiId),
  }
}

function buildSearchUrl(query: string) {
  const url = new URL(SEARCH_ENDPOINT)

  url.searchParams.set("q", query)
  url.searchParams.set("campusid", String(MAZEMAP_CAMPUS_ID))
  url.searchParams.set("rows", String(MAXIMUM_RESULTS))
  url.searchParams.set("withpois", "true")
  url.searchParams.set("withbuilding", "false")
  url.searchParams.set("withtype", "false")
  url.searchParams.set("withcampus", "false")

  return url
}

const cache = new LRUCache<string, MazemapRoom[]>({
  max: 500,
  ttl: hoursToMilliseconds(1),
})

export async function searchMazemapRooms(query: string): Promise<MazemapRoom[]> {
  const trimmedQuery = query.trim()

  if (trimmedQuery === "") {
    return []
  }

  const cached = cache.get(trimmedQuery)

  if (cached !== undefined) {
    return cached
  }

  const response = await fetch(buildSearchUrl(trimmedQuery))

  if (!response.ok) {
    throw new InternalServerError("Kunne ikke søke i Mazemap")
  }

  const payload: { result?: MazemapSearchHit[] } = await response.json()
  const rooms = (payload.result ?? []).map(toRoom).filter((room): room is MazemapRoom => room !== null)

  cache.set(trimmedQuery, rooms)

  return rooms
}
