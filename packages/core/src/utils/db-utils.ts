import { type SelectQueryBuilder, sql } from "kysely";
import { z } from "zod";

export const CursorSchema = z.object({
    id: z.string(),
    createdAt: z.date(),
});

export const PaginateInputSchema = z
    .object({
        take: z.number(),
        cursor: CursorSchema.optional(),
    })
    .optional()
    .default({ take: 20, cursor: undefined });

export type Cursor = z.infer<typeof CursorSchema>;

/* eslint-disable */
export function paginateQuery(qb: SelectQueryBuilder<any, any, any>, cursor: Cursor) {
    // This is not camelcased due to the query not going through the camelcase plugin.
    // This is an exception.
    return qb
        .where(sql`(created_at, id)`, "<", sql`(${cursor.createdAt}, ${cursor.id})`)
        .orderBy("created_at", "desc")
        .orderBy("id", "desc");
}
