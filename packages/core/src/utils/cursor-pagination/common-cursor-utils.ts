import type { Cursor } from "./types"

export const base64Encode = (value: string) => Buffer.from(value).toString("base64")
export const base64Decode = (value: string) => Buffer.from(value, "base64").toString("ascii")

type RecordWithUlidId = { id: string }
export function buildUlidIdCursor<O extends RecordWithUlidId>(record: O): Cursor {
  return base64Encode(record.id)
}
export function decodeUlidIdCursor(cursor: Cursor): string {
  return base64Decode(cursor)
}

type RecordWithCreatedAt = { createdAt: string }
export function buildCreatedAtCursor<O extends RecordWithCreatedAt>(record: O): Cursor {
  return base64Encode(record.createdAt)
}
export function decodeCreatedAtCursor(cursor: Cursor): string {
  return base64Decode(cursor)
}
