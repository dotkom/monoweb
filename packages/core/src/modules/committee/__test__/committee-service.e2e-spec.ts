import { createEnvironment } from "@dotkomonline/env"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getCommitteeMock } from "../../../../mock"
import { type CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"

import type { Database } from "@dotkomonline/db"
import type { Kysely } from "kysely"
import { type CommitteeRepository, CommitteeRepositoryImpl } from "../committee-repository"
import { type CommitteeService, CommitteeServiceImpl } from "../committee-service"

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

describe("committees", () => {
  let core: ServiceLayer
  let cleanup: CleanupFunction

  beforeEach(async () => {
    const env = createEnvironment()
    const context = await createServiceLayerForTesting(env, "committee")
    cleanup = context.cleanup
    core = await createServiceLayer({ db: context.kysely })
  })

  afterEach(async () => {
    await cleanup()
  })

  it("will get committees", async () => {
    const testData = [{ name: "test1" }, { name: "test2" }, { name: "test3" }, { name: "test4" }, { name: "test5" }]

    // Create committees
    for (const data of testData) {
      await core.committeeService.createCommittee(getCommitteeMock(data))
    }

    // Test pagination
    const firstPage = await core.committeeService.getCommittees({ take: 2 })
    expect(firstPage.data.length).toEqual(2)
    expect(firstPage.next).not.toBeNull()

    const secondPage = await core.committeeService.getCommittees({
      take: 2,
      cursor: firstPage.next,
    })
    expect(secondPage.data.length).toEqual(2)
    expect(secondPage.next).not.toBeNull()

    const thirdPage = await core.committeeService.getCommittees({
      take: 2,
      cursor: secondPage.next,
    })
    expect(thirdPage.data.length).toEqual(1) // Only one item left
    expect(thirdPage.next).toBeNull()

    // Ensure no more items after the last page
    const fourthPage = await core.committeeService.getCommittees({
      take: 2,
      cursor: thirdPage.next,
    })

    expect(fourthPage.data.length).toEqual(0)
    expect(fourthPage.next).toBeNull()
  })
})
