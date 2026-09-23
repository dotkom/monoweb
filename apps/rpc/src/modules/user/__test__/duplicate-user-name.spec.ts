import { describe, expect, it } from "vitest"
import { namesLookLikeSamePerson } from "../duplicate-user-name"

describe("namesLookLikeSamePerson", () => {
  it("matches identical names", () => {
    expect(namesLookLikeSamePerson("Kari Nordmann Hansen", "Kari Nordmann Hansen")).toBe(true)
  })

  it("matches a name that dropped a middle name", () => {
    expect(namesLookLikeSamePerson("Kari Hansen", "Kari Oline Hansen")).toBe(true)
  })

  it("matches a name that dropped an extra surname", () => {
    expect(namesLookLikeSamePerson("Kari Nordmann", "Kari Nordmann Hansen")).toBe(true)
  })

  it("matches a name that dropped the first given name", () => {
    expect(namesLookLikeSamePerson("Christopher Olsen", "Hans Christopher Olsen")).toBe(true)
  })

  it("matches hyphenated given names as separate tokens", () => {
    expect(namesLookLikeSamePerson("Marie Hansen", "Anne-Marie Hansen")).toBe(true)
  })

  it("does not match a single given name", () => {
    expect(namesLookLikeSamePerson("Christopher", "Hans Christopher Olsen")).toBe(false)
  })

  it("does not match tokens that appear in a different order", () => {
    expect(namesLookLikeSamePerson("Olsen Christopher", "Hans Christopher Olsen")).toBe(false)
  })

  it("does not match unrelated names that only share a surname", () => {
    expect(namesLookLikeSamePerson("Kari Hansen", "Ole Hansen")).toBe(false)
  })
})
