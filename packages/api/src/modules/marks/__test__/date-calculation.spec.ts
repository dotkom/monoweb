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
    const start_date = new Date("3022-10-01")
    const marks = [
      {
        id: randomUUID(),
        givenAt: start_date,
        duration: 24,
      },
    ]

    expect(personalMarkService.calculateExpiryDate(marks)).toEqual(
      new Date(start_date.setDate(start_date.getDate() + marks[0].duration))
    )
  }),
    it("Adds durations iteratively for several active marks", () => {
      const start_date = new Date("3022-10-01")
      const marks = [
        {
          id: randomUUID(),
          givenAt: start_date,
          duration: 22,
        },
        {
          id: randomUUID(),
          givenAt: start_date,
          duration: 23,
        },
      ]
      expect(personalMarkService.calculateExpiryDate(marks)).toEqual(
        new Date(start_date.setDate(start_date.getDate() + marks[0].duration + marks[1].duration))
      )
    }),
    it("Skips holidays and continues after they're done", () => {
      const start_date_winter = new Date("3022-11-01")
      const winter_marks = [
        {
          id: randomUUID(),
          givenAt: start_date_winter,
          duration: 30,
        },
      ]

      const start_date_summer = new Date("3022-05-01")
      const summer_marks = [
        {
          id: randomUUID(),
          givenAt: start_date_summer,
          duration: 31,
        },
      ]
      expect(personalMarkService.calculateExpiryDate(winter_marks)).toEqual(
        new Date(start_date_winter.setDate(start_date_winter.getDate() + winter_marks[0].duration + 45))
      )

      expect(personalMarkService.calculateExpiryDate(summer_marks)).toEqual(
        new Date(start_date_summer.setDate(start_date_summer.getDate() + summer_marks[0].duration + 75))
      )
    }),
    it("Doesn't add expired marks to the duration", () => {
      const start_date = new Date("3022-10-01")
      const old_date = new Date("1970-01-01")
      const marks = [
        {
          id: randomUUID(),
          givenAt: old_date,
          duration: 20,
        },
        {
          id: randomUUID(),
          givenAt: old_date,
          duration: 24,
        },
        {
          id: randomUUID(),
          givenAt: start_date,
          duration: 21,
        },
      ]
      expect(personalMarkService.calculateExpiryDate(marks)).toEqual(
        new Date(start_date.setDate(start_date.getDate() + marks[2].duration))
      )
    }),
    it("Doesn't add expired marks to the duration, even if they're the only marks", () => {
      const old_date = new Date("1970-01-01")
      const marks = [
        {
          id: randomUUID(),
          givenAt: old_date,
          duration: 1000,
        },
      ]
      expect(personalMarkService.calculateExpiryDate(marks)).toEqual(null)
    }),
    it("Correctly adjusts for marks that would have expired, but don't because they add onto a previous mark", () => {
      const start_date = new Date("3022-10-01")
      const marks = [
        {
          id: randomUUID(),
          givenAt: start_date,
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
        new Date(start_date.setDate(start_date.getDate() + 30))
      )
    }),
    it("Returns null for an empty array (no marks)", () => {
      const marks: Mark[] = []
      expect(personalMarkService.calculateExpiryDate(marks)).toEqual(null)
    })
})
