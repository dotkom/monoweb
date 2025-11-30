import type { BRAND } from "zod"

export * from "./article"
export * from "./attendance"
export * from "./company"
export * from "./event"
export * from "./feedback-form"
export * from "./filters"
export * from "./group"
export * from "./job-listing"
export * from "./mark"
export * from "./notification-permissions"
export * from "./offline"
export * from "./privacy-permissions"
export * from "./task"
export * from "./user"
export * from "./audit-log"
export * from "./workspace-sync"

/** Recursively remove Zod brand types from a type */
export type Unbranded<T extends Record<PropertyKey, unknown>> = {
  [K in keyof T]: T[K] extends Record<PropertyKey, unknown>
    ? Unbranded<T[K]>
    : T[K] extends Array<infer I extends Record<PropertyKey, unknown>>
      ? Array<Unbranded<I>>
      : T[K] extends Array<infer I>
        ? I[]
        : T[K] extends infer U extends BRAND<infer _TBrand>
          ? U extends string
            ? string
            : U extends number
              ? number
              : U extends infer S extends symbol
                ? S
                : U
          : T[K]
}
