import { createEnvironment } from "@dotkomonline/env"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import type { Database } from "@dotkomonline/db"
import type { CommitteeWrite } from "@dotkomonline/types"
import type { Kysely } from "kysely"
import { getCommitteeMock } from "../../mock"
import { type CleanupFunction, createServiceLayerForTesting } from "../../vitest-integration.setup"
import { type CommitteeRepository, CommitteeRepositoryImpl } from "../modules/committee/committee-repository"
import { type CommitteeService, CommitteeServiceImpl } from "../modules/committee/committee-service"
import { paginatedQuery } from "./cursor"

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

  it("works to sort on multiple columns", async () => {
    const testData: Partial<CommitteeWrite>[] = [
      { name: "test2", email: "b" },
      { name: "test2", email: "a" },

      { name: "test1", email: "d" },
      { name: "test1", email: "c" },
      { name: "test1", email: "b" },
    ]

    // Create committees
    for (const data of testData) {
      await core.committeeService.createCommittee(getCommitteeMock(data))
    }

    const query = db.selectFrom("committee").selectAll()
    const firstResult = await paginatedQuery(query, {
      columns: ["name", "email"],
      order: "asc",
      pageable: {
        cursor: undefined,
        take: 3,
      },
    })

    expect(firstResult.data.length).toEqual(3)
    expect(firstResult.next).not.toEqual(null)
    expect(firstResult.data[0].email).toEqual("b")
    expect(firstResult.data[0].name).toEqual("test1")

    expect(firstResult.data[1].email).toEqual("c")
    expect(firstResult.data[1].name).toEqual("test1")

    expect(firstResult.data[2].email).toEqual("d")
    expect(firstResult.data[2].name).toEqual("test1")

    const secondResult = await paginatedQuery(query, {
      columns: ["name", "email"],
      order: "asc",
      pageable: {
        cursor: firstResult.next,
        take: 1,
      },
    })

    // try grabbing only the next item
    expect(secondResult.data.length).toEqual(1)
    expect(secondResult.next).not.toEqual(null)
    expect(secondResult.data[0].email).toEqual("a")
    expect(secondResult.data[0].name).toEqual("test2")

    // Try grabbing the final two items after the first three
    const thirdResult = await paginatedQuery(query, {
      columns: ["name", "email"],
      order: "asc",
      pageable: {
        cursor: firstResult.next,
        take: 2,
      },
    })

    expect(thirdResult.data.length).toEqual(2)
    expect(thirdResult.next).toEqual(null)

    expect(thirdResult.data[0].email).toEqual("a")
    expect(thirdResult.data[0].name).toEqual("test2")

    expect(thirdResult.data[1].email).toEqual("b")
    expect(thirdResult.data[1].name).toEqual("test2")
  })
})
