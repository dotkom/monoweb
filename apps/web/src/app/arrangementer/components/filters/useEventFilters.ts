import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { getCurrentUTC } from "@dotkomonline/utils"
import { roundToNearestMinutes } from "date-fns"
import { EventTypeSchema, GroupSchema } from "@dotkomonline/types"
import { EventListViewModeSchema } from "../EventList"
import { z } from "zod"

const FilterParamsSchema = z.object({
  search: z.string(),
  types: z.array(EventTypeSchema),
  groups: z.array(GroupSchema.shape.slug),
  viewMode: EventListViewModeSchema,
  view: z.enum(["list", "cal"]),
  year: z.number(),
  month: z.number().min(0).max(11),
})

export type FilterParams = z.infer<typeof FilterParamsSchema>

export function useEventFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const now = roundToNearestMinutes(getCurrentUTC(), { roundingMethod: "floor" })

  const filters = useMemo(() => {
    const typeParam = searchParams.get("type") || ""
    const groupParam = searchParams.get("group") || ""

    // parse and validate types
    const typeArray = typeParam ? typeParam.split(",").filter(Boolean) : []
    const typesResult = EventTypeSchema.array().safeParse(typeArray)
    const validTypes = typesResult.success ? typesResult.data : []

    // parse and validate groups
    const groupArray = groupParam ? groupParam.split(",").filter(Boolean) : []
    const groupsResult = z.array(GroupSchema.shape.slug).safeParse(groupArray)
    const validGroups = groupsResult.success ? groupsResult.data : []

    // parse and validate view mode
    const viewModeParam = searchParams.get("sort") || "ATTENDANCE"
    const viewModeResult = EventListViewModeSchema.safeParse(viewModeParam)
    const validViewMode = viewModeResult.success ? viewModeResult.data : "ATTENDANCE"

    return {
      search: searchParams.get("search") || "",
      types: validTypes,
      groups: validGroups,
      viewMode: validViewMode,
      view: searchParams.get("view") === "cal" ? "cal" : "list",
      year: Number(searchParams.get("y") || now.getFullYear()),
      month: Number(searchParams.get("m") || now.getMonth() + 1) - 1,
    }
  }, [searchParams, now])

  const updateFilters = useCallback(
    (updates: Partial<typeof filters>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (key === "types") {
          const arr = value as string[]
          if (!arr || arr.length === 0) {
            params.delete("type")
          } else {
            params.set("type", arr.join(","))
          }
        } else if (key === "groups") {
          const arr = value as string[]
          if (!arr || arr.length === 0) {
            params.delete("group")
          } else {
            params.set("group", arr.join(","))
          }
        } else if (key === "search") {
          if (!value) {
            params.delete("search")
          } else {
            params.set("search", String(value))
          }
        } else if (key === "viewMode") {
          if (value === "ATTENDANCE") {
            params.delete("sort")
          } else {
            params.set("sort", String(value))
          }
        } else if (key === "view") {
          if (value === "list") {
            params.delete("view")
          } else {
            params.set("view", String(value))
          }
        } else if (key === "year") {
          params.set("y", String(value))
        } else if (key === "month") {
          params.set("m", String((value as number) + 1))
        }
      })

      const queryString = params.toString()
      router.replace(queryString ? `/arrangementer?${queryString}` : "/arrangementer", { scroll: false })
    },
    [searchParams, router]
  )

  return { filters, updateFilters }
}
