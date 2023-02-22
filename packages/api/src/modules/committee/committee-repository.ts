import { Database } from "@dotkomonline/db"
import { Committee, CommitteeSchema, CommitteeWrite } from "@dotkomonline/types"
import { Kysely, Selectable } from "kysely"

export const mapToCommittee = (payload: Selectable<Database["committee"]>): Committee => {
  return CommitteeSchema.parse(payload)
}

export interface CommitteeRepository {
  getCommitteeById: (id: string) => Promise<Committee | undefined>
  getCommittees: (limit: number, offset?: number) => Promise<Committee[]>
  create: (values: CommitteeWrite) => Promise<Committee>
}

export const initCommitteeRepository = (db: Kysely<Database>): CommitteeRepository => {
  const repo: CommitteeRepository = {
    getCommitteeById: async (id) => {
      const committee = await db.selectFrom("committee").selectAll().where("id", "=", id).executeTakeFirst()
      return committee ? mapToCommittee(committee) : undefined
    },
    getCommittees: async (limit, offset = 0) => {
      const committees = await db.selectFrom("committee").selectAll().offset(offset).limit(limit).execute()
      return committees.map(mapToCommittee)
    },
    create: async (values) => {
      const committee = await db
        .insertInto("committee")
        .values({
          name: values.name,
        })
        .returningAll()
        // It should not be possible for this to throw, since there are no
        // restrictions on creating committees, as name is not unique.
        .executeTakeFirstOrThrow()
      return mapToCommittee(committee)
    },
  }
  return repo
}
