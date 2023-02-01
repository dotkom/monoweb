import { randomUUID } from "crypto"
import { Kysely } from "kysely"

import { Mark } from "@dotkomonline/types"
import { initMarkRepository } from "../mark-repository"
import { initMarkService } from "../mark-service"
import { initPersonalMarkRepository } from "../personal-mark-repository"
import { initPersonalMarkService } from "../personal-mark-service"

describe("PersonalMarkDateCalculation", () => {
  const db = vi.mocked(Kysely.prototype, true)
  const personalMarkRepository = initPersonalMarkRepository(db)
  const markRepository = initMarkRepository(db)
  const markService = initMarkService(markRepository)
  const personalMarkService = initPersonalMarkService(personalMarkRepository, markService)

  // These tests are written to work until the year 3022. If you are reading this in 3022, please update the tests. Let those 4022 guys deal with it.

  it("Adds the correct duration to the current start date", () => {
    const startDate = new Date("3022-10-01")
    const marks = [
      {
        id: randomUUID(),
        givenAt: startDate,
        duration: 24,
      },
    ]

    expect(personalMarkService.calculateExpiryDate(marks)).toEqual(
      new Date(startDate.setDate(startDate.getDate() + marks[0].duration))
    )
  }),
    it("Adds durations iteratively for several active marks", () => {
      const startDate = new Date("3022-10-01")
      const marks = [
        {
          id: randomUUID(),
          givenAt: startDate,
          duration: 22,
        },
        {
          id: randomUUID(),
          givenAt: startDate,
          duration: 23,
        },
      ]
      expect(personalMarkService.calculateExpiryDate(marks)).toEqual(
        new Date(startDate.setDate(startDate.getDate() + marks[0].duration + marks[1].duration))
      )
    }),
    it("Skips holidays and continues after they're done", () => {
      const startDateWinter = new Date("3022-11-01")
      const winterMarks = [
        {
          id: randomUUID(),
          givenAt: startDateWinter,
          duration: 30,
        },
      ]

      const startDateSummer = new Date("3022-05-01")
      const summerMarks = [
        {
          id: randomUUID(),
          givenAt: startDateSummer,
          duration: 31,
        },
      ]
      expect(personalMarkService.calculateExpiryDate(winterMarks)).toEqual(
        new Date(startDateWinter.setDate(startDateWinter.getDate() + winterMarks[0].duration + 45))
      )

      expect(personalMarkService.calculateExpiryDate(summerMarks)).toEqual(
        new Date(startDateSummer.setDate(startDateSummer.getDate() + summerMarks[0].duration + 75))
      )
    }),
    it("Doesn't add expired marks to the duration", () => {
      const startDate = new Date("3022-10-01")
      const oldDate = new Date("1970-01-01")
      const marks = [
        {
          id: randomUUID(),
          givenAt: oldDate,
          duration: 20,
        },
        {
          id: randomUUID(),
          givenAt: oldDate,
          duration: 24,
        },
        {
          id: randomUUID(),
          givenAt: startDate,
          duration: 21,
        },
      ]
      expect(personalMarkService.calculateExpiryDate(marks)).toEqual(
        new Date(startDate.setDate(startDate.getDate() + marks[2].duration))
      )
    }),
    it("Doesn't add expired marks to the duration, even if they're the only marks", () => {
      const oldDate = new Date("1970-01-01")
      const marks = [
        {
          id: randomUUID(),
          givenAt: oldDate,
          duration: 1000,
        },
      ]
      expect(personalMarkService.calculateExpiryDate(marks)).toEqual(null)
    }),
    it("Correctly adjusts for marks that would have expired, but don't because they add onto a previous mark", () => {
      const startDate = new Date("3022-10-01")
      const marks = [
        {
          id: randomUUID(),
          givenAt: startDate,
          duration: 10,
        },
        {
          id: randomUUID(),
          givenAt: new Date("3022-10-12"),
          duration: 10,
        },
        {
          id: randomUUID(),
          givenAt: new Date("3022-10-05"),
          duration: 10,
        },
      ]
      expect(personalMarkService.calculateExpiryDate(marks)).toEqual(
        new Date(startDate.setDate(startDate.getDate() + 30))
      )
    }),
    it("Returns null for an empty array (no marks)", () => {
      const marks: Mark[] = []
      expect(personalMarkService.calculateExpiryDate(marks)).toEqual(null)
    })
})
