import { createEnvironment } from "@dotkomonline/env"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import type { Database } from "@dotkomonline/db"
import type { CommitteeWrite } from "@dotkomonline/types"
import type { Kysely } from "kysely"
import { getCommitteeMock } from "../../mock"
import { type CleanupFunction, createServiceLayerForTesting } from "../../vitest-integration.setup"
import { type CommitteeRepository, CommitteeRepositoryImpl } from "../modules/committee/committee-repository"
import { type CommitteeService, CommitteeServiceImpl } from "../modules/committee/committee-service"
import { base64Decode, base64Encode, buildUlidIdCursor, decodeUlidIdCursor, singleColPaginatedQuery } from "./cursor"

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

interface ServerLayerOptions {
  db: Kysely<Database>
}
const createServiceLayer = async ({ db }: ServerLayerOptions) => {
  const committeRepository: CommitteeRepository = new CommitteeRepositoryImpl(db)
  const committeeService: CommitteeService = new CommitteeServiceImpl(committeRepository)

  return {
    committeeService,
  }
}

describe("cursor pagination", () => {
  let core: ServiceLayer
  let cleanup: CleanupFunction
  let db: Kysely<Database>

  beforeEach(async () => {
    const env = createEnvironment()
    const context = await createServiceLayerForTesting(env, "cursor-pagination")
    cleanup = context.cleanup
    core = await createServiceLayer({ db: context.kysely })
    db = context.kysely
  })

  afterEach(async () => {
    await cleanup()
  })

  it("works", async () => {
    const testData = [{ name: "test1" }, { name: "test2" }, { name: "test3" }, { name: "test4" }, { name: "test5" }]

    // Create committees
    for (const data of testData) {
      await core.committeeService.createCommittee(getCommitteeMock(data))
    }

    const query = db.selectFrom("committee").selectAll()
    const result = await singleColPaginatedQuery(query, {
      buildCursor: buildUlidIdCursor,
      decodeCursor: decodeUlidIdCursor,
      column: ["id"],
      order: "desc",
      pageable: {
        cursor: undefined,
        take: 3,
      },
    })

    expect(result.data.length).toEqual(3)
    const expected = ["test5", "test4", "test3"]
    expected.forEach((name: string, i: number) => {
      expect(result.data[i].name).toEqual(name)
    })
  })

  it("works to sort on multiple columns", async () => {
    const testData: Partial<CommitteeWrite>[] = [
      { name: "test1", email: "a" },
      { name: "test1", email: "c" },
      { name: "test1", email: "b" },
    ]

    // Create committees
    for (const data of testData) {
      await core.committeeService.createCommittee(getCommitteeMock(data))
    }

    const query = db.selectFrom("committee").selectAll()
    const result = await singleColPaginatedQuery(query, {
      buildCursor: (row) => base64Encode(`${row.createdAt.toISOString()}|${row.name}`), // TODO: find safer way to encode, now any pipes in name will break decoding
      decodeCursor: (cursor) => {
        const raw = base64Decode(cursor)
        const [name, email] = raw.split("|")

        return [name, email]
      },
      column: ["name", "email"],
      order: "desc",
      pageable: {
        cursor: undefined,
        take: 3,
      },
    })

    expect(result.data.length).toEqual(3)
    const expected = ["c", "b", "a"]
    expected.forEach((email: string, i: number) => {
      expect(result.data[i].email).toEqual(email)
    })
  })
})
