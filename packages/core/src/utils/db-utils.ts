import { type SelectQueryBuilder, sql } from "kysely"
import { z } from "zod"

export type Keys<T> = {
  [K in keyof T]: unknown
}

type ObjectWithKey<T> = T extends object ? T : never
type ObjectWithStringifiedProperty<T extends object, K extends keyof T> = T & { [Property in K]: string }

export function withInsertJsonValue<T extends object, K extends keyof T>(
  originalObject: ObjectWithKey<T>,
  propertyToConvert: K
): ObjectWithStringifiedProperty<T, K> {
  const stringifiedPropertyValue = JSON.stringify(originalObject[propertyToConvert])

  return {
    ...originalObject,
    [propertyToConvert]: stringifiedPropertyValue,
  }
}

// https://node-postgres.com/features/types#date--timestamp--timestamptz deserialized datetime fields automatically, but when using json_build_object, the createdAt field is returned as a string instead of being parsed as a Date.
// This function deserializes datetime fields to js Date objects if they are present in the result.
export const fixJsonDatesStandardCols = <T extends { createdAt?: string | Date, updatedAt?: string | Date }>(obj?: T | null | undefined) : T =>{
  let final = {

  }
  if(obj?.createdAt instanceof Date) {
    final = {
      createdAt: new Date(obj.createdAt)
    }
  }

  if(obj?.updatedAt instanceof Date) {
    final = {
      ...final,
      updatedAt: new Date(obj.updatedAt)
    }
  }

  if(!obj) return {} as T

  return {
    ...obj,
    ...final
  }
}

export const fixDate = <T>(obj: T, prop: keyof T) => {
  return {
    ...obj,
    [prop]: new Date(obj[prop] as string)
  }
}


export const CursorSchema = z.object({
  id: z.string().ulid(),
})

export const PaginateInputSchema = z
  .object({
    take: z.number(),
    cursor: CursorSchema.optional(),
  })
  .optional()
  .default({ take: 20, cursor: undefined })

export type Pageable = z.infer<typeof PaginateInputSchema>
export type Cursor = z.infer<typeof CursorSchema>

export function orderedQuery<DB, TB extends keyof DB, O>(qb: SelectQueryBuilder<DB, TB, O>, cursor?: Cursor) {
  let queryBuilder = qb

  if (cursor) {
    queryBuilder = qb.where(sql`id`, "<", sql`${cursor.id}`)
  }

  return queryBuilder.orderBy(sql`id`, "desc")
}
