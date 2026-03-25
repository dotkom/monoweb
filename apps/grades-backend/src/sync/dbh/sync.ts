import * as z from "zod"
import { filterSchema, institutionFilter, taskFilter } from "./filters"

const BASE_URL = "https://dbh.hkdir.no"
const TABLE_URL = `${BASE_URL}/api/Tabeller/hentJSONTabellData`

const API_VERSION = 1
const STATUS_LINE = false  // Should extra information about the API response be included?
const CODE_TEXT = true  // Should names of related resources be included?
const DECIMAL_SEPERATOR = "."

const querySchema = z.object({
	tabell_id: z.number(),
	api_versjon: z.number().default(API_VERSION),
	statuslinje: z.string().default(STATUS_LINE ? "J" : "N"),
	kodetekst: z.string().default(CODE_TEXT ? "J" : "N"),
	desimal_seperator: z.string().default(DECIMAL_SEPERATOR),
	sortBy: z.array(z.string()).default([]),
	variabler: z.array(z.string()).default(["*"]),
	filter: z.array(filterSchema).default([]),
	groupBy: z.array(z.string()).optional(),
	begrensning: z.coerce.string().optional()
})

export const getAllGrades = async () => {
	const tableId = 308

	const groupBy = [
		"Institusjonskode",
		"Emnekode",
		"Karakter",
		"Årstall",
		"Semester",
		"Avdelingskode",
	]
	const sortBy = ["Emnekode", "Årstall", "Semester"]
	const filters = [institutionFilter]

	const query = querySchema.parse({
		tabell_id: tableId,
		sortBy,
		filter: filters,
		groupBy,
	})

	const res = await fetch(TABLE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(query)
	})

	return await res.json()
}

export const getAllCourses = async () => {
	const tableId = 208

	const sortBy = ["Emnekode", "Årstall", "Semester"]
	const filters = [institutionFilter, taskFilter]

	const query = querySchema.parse({
		tabell_id: tableId,
		sortBy,
		filter: filters,
	})

	const res = await fetch(TABLE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(query)
	})

	return await res.json()
}
