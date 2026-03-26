import * as z from "zod"

const INSTITUTION_ID = 1150 // ID for NTNU in DBH databases

export const filterFilter = {
  TOP: "top",
  ALL: "all",
  ITEM: "item",
  BETWEEN: "between",
  LIKE: "like",
  LESSTHAN: "lessthan",
} as const

export const filterSchema = z.object({
  variabel: z.string(),
  selection: z.object({
    filter: z.nativeEnum(filterFilter),
    values: z.array(z.coerce.string()),
    exclude: z.array(z.coerce.string()).default([""]),
  }),
})

export const institutionFilter = filterSchema.parse({
  variabel: "Institusjonskode",
  selection: {
    filter: filterFilter.ITEM,
    values: [INSTITUTION_ID],
  },
})

export const taskFilter = filterSchema.parse({
  variabel: "Oppgave (ny fra h2012)",
  selection: {
    filter: filterFilter.ALL,
    values: ["*"],
    exclude: ["1", "2"],
  },
})
