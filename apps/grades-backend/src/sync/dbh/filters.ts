import * as z from "zod"

const INSTITUTION_ID = 1150 // ID for NTNU in DBH databases

export const filter = {
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
    filter: z.nativeEnum(filter),
    values: z.array(z.unknown()),
    exclude: z.array(z.unknown()).default([""]),
  }),
})

export const institutionFilter = filterSchema.parse({
  variabel: "Institusjonskode",
  selection: {
    filter: filter.ITEM,
    values: [INSTITUTION_ID],
  },
})

export const taskFilter = filterSchema.parse({
  variabel: "Oppgave (ny fra h2012)",
  selection: {
    filter: filter.ALL,
    values: ["*"],
    exclude: ["1", "2"],
  },
})
