import { z } from "zod"

export const MAZEMAP_CAMPUS_ID = 1

export const MazemapRoomSchema = z.object({
  poiId: z.int(),
  campusId: z.int(),
  name: z.string(),
  building: z.string().nullable(),
  floor: z.string().nullable(),
  link: z.string(),
})
export type MazemapRoom = z.infer<typeof MazemapRoomSchema>

const MAZEMAP_ROOM_LINK_PATTERN = /^https:\/\/use\.mazemap\.com\/#v=1&campusid=\d+&sharepoitype=poi&sharepoi=\d+$/

export function buildMazemapLink(campusId: number, poiId: number) {
  return `https://use.mazemap.com/#v=1&campusid=${campusId}&sharepoitype=poi&sharepoi=${poiId}`
}

export function hasValidMazemapRoom(locationName: string, locationUrl: string | null): boolean {
  return locationName.trim() !== "" && locationUrl !== null && MAZEMAP_ROOM_LINK_PATTERN.test(locationUrl.trim())
}
