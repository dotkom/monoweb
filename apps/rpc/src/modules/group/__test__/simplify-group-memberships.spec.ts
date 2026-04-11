import { randomUUID } from "node:crypto"
import type { GroupMembership, GroupRole } from "@dotkomonline/types"
import { describe, expect, it } from "vitest"
import { simplifyGroupMemberships } from "../group-service"

const roleA: GroupRole = { id: "role-a", name: "Role A", type: "COSMETIC", groupId: "group-1" }
const roleB: GroupRole = { id: "role-b", name: "Role B", type: "COSMETIC", groupId: "group-1" }
const roleC: GroupRole = { id: "role-c", name: "Role C", type: "COSMETIC", groupId: "group-1" }

function makeMembership(overrides: Partial<GroupMembership> = {}): GroupMembership {
  return {
    id: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    groupId: "group-1",
    userId: "user-1",
    roles: [],
    start: new Date("2024-01-01"),
    end: new Date("2024-06-01"),
    ...overrides,
  }
}

describe("simplifyGroupMemberships", () => {
  it("returns an empty array for no memberships", () => {
    expect(simplifyGroupMemberships([])).toEqual([])
  })

  it("returns a single membership unchanged", () => {
    const m = makeMembership({ roles: [roleA] })
    const result = simplifyGroupMemberships([m])

    expect(result).toHaveLength(1)
    expect(result[0].start).toEqual(m.start)
    expect(result[0].end).toEqual(m.end)
    expect(result[0].roles).toEqual([roleA])
  })

  it("merges adjacent memberships with identical roles into one", () => {
    const m1 = makeMembership({ start: new Date("2024-01-01"), end: new Date("2024-03-01"), roles: [roleA] })
    const m2 = makeMembership({ start: new Date("2024-03-01"), end: new Date("2024-06-01"), roles: [roleA] })

    const result = simplifyGroupMemberships([m1, m2])

    expect(result).toHaveLength(1)
    expect(result[0].start).toEqual(new Date("2024-01-01"))
    expect(result[0].end).toEqual(new Date("2024-06-01"))
    expect(result[0].roles).toEqual([roleA])
  })

  it("does not merge adjacent memberships with different roles", () => {
    const m1 = makeMembership({ start: new Date("2024-01-01"), end: new Date("2024-03-01"), roles: [roleA] })
    const m2 = makeMembership({ start: new Date("2024-03-01"), end: new Date("2024-06-01"), roles: [roleB] })

    const result = simplifyGroupMemberships([m1, m2])

    expect(result).toHaveLength(2)
    expect(result[0].start).toEqual(new Date("2024-01-01"))
    expect(result[0].end).toEqual(new Date("2024-03-01"))
    expect(result[1].start).toEqual(new Date("2024-03-01"))
    expect(result[1].end).toEqual(new Date("2024-06-01"))
  })

  it("splits overlapping memberships with different roles into segments", () => {
    // A: Jan-Apr, B: Feb-Jun → segments: Jan-Feb(A), Feb-Apr(AB), Apr-Jun(B)
    const mA = makeMembership({ start: new Date("2024-01-01"), end: new Date("2024-04-01"), roles: [roleA] })
    const mB = makeMembership({ start: new Date("2024-02-01"), end: new Date("2024-06-01"), roles: [roleB] })

    const result = simplifyGroupMemberships([mA, mB])

    expect(result).toHaveLength(3)

    expect(result[0].start).toEqual(new Date("2024-01-01"))
    expect(result[0].end).toEqual(new Date("2024-02-01"))
    expect(result[0].roles.map((r) => r.id)).toEqual([roleA.id])

    expect(result[1].start).toEqual(new Date("2024-02-01"))
    expect(result[1].end).toEqual(new Date("2024-04-01"))
    expect(new Set(result[1].roles.map((r) => r.id))).toEqual(new Set([roleA.id, roleB.id]))

    expect(result[2].start).toEqual(new Date("2024-04-01"))
    expect(result[2].end).toEqual(new Date("2024-06-01"))
    expect(result[2].roles.map((r) => r.id)).toEqual([roleB.id])
  })

  it("produces one segment for fully coincident memberships, combining roles", () => {
    const mA = makeMembership({ start: new Date("2024-01-01"), end: new Date("2024-06-01"), roles: [roleA] })
    const mB = makeMembership({ start: new Date("2024-01-01"), end: new Date("2024-06-01"), roles: [roleB] })

    const result = simplifyGroupMemberships([mA, mB])

    expect(result).toHaveLength(1)
    expect(result[0].start).toEqual(new Date("2024-01-01"))
    expect(result[0].end).toEqual(new Date("2024-06-01"))
    expect(new Set(result[0].roles.map((r) => r.id))).toEqual(new Set([roleA.id, roleB.id]))
  })

  it("preserves end=null for an ongoing membership", () => {
    const m = makeMembership({ start: new Date("2024-01-01"), end: null, roles: [roleA] })

    const result = simplifyGroupMemberships([m])

    expect(result).toHaveLength(1)
    expect(result[0].end).toBeNull()
  })

  it("correctly segments an overlapping membership against an ongoing one", () => {
    // A: Jan-Apr, B: Feb-null → segments: Jan-Feb(A), Feb-Apr(AB), Apr-null(B)
    const mA = makeMembership({ start: new Date("2024-01-01"), end: new Date("2024-04-01"), roles: [roleA] })
    const mB = makeMembership({ start: new Date("2024-02-01"), end: null, roles: [roleB] })

    const result = simplifyGroupMemberships([mA, mB])

    expect(result).toHaveLength(3)

    expect(result[0].start).toEqual(new Date("2024-01-01"))
    expect(result[0].end).toEqual(new Date("2024-02-01"))
    expect(result[0].roles.map((r) => r.id)).toEqual([roleA.id])

    expect(result[1].start).toEqual(new Date("2024-02-01"))
    expect(result[1].end).toEqual(new Date("2024-04-01"))
    expect(new Set(result[1].roles.map((r) => r.id))).toEqual(new Set([roleA.id, roleB.id]))

    expect(result[2].start).toEqual(new Date("2024-04-01"))
    expect(result[2].end).toBeNull()
    expect(result[2].roles.map((r) => r.id)).toEqual([roleB.id])
  })

  it("handles the docstring example: A(0-2), B(1-4), C(3-5) → 5 segments", () => {
    // Using months as time units:
    // A: Jan-Mar, B: Feb-May, C: Apr-Jun
    // Expected: Jan-Feb(A), Feb-Mar(AB), Mar-Apr(B), Apr-May(BC), May-Jun(C)
    const mA = makeMembership({ start: new Date("2024-01-01"), end: new Date("2024-03-01"), roles: [roleA] })
    const mB = makeMembership({ start: new Date("2024-02-01"), end: new Date("2024-05-01"), roles: [roleB] })
    const mC = makeMembership({ start: new Date("2024-04-01"), end: new Date("2024-06-01"), roles: [roleC] })

    const result = simplifyGroupMemberships([mA, mB, mC])

    expect(result).toHaveLength(5)

    expect(result[0].start).toEqual(new Date("2024-01-01"))
    expect(result[0].end).toEqual(new Date("2024-02-01"))
    expect(result[0].roles.map((r) => r.id)).toEqual([roleA.id])

    expect(result[1].start).toEqual(new Date("2024-02-01"))
    expect(result[1].end).toEqual(new Date("2024-03-01"))
    expect(new Set(result[1].roles.map((r) => r.id))).toEqual(new Set([roleA.id, roleB.id]))

    expect(result[2].start).toEqual(new Date("2024-03-01"))
    expect(result[2].end).toEqual(new Date("2024-04-01"))
    expect(result[2].roles.map((r) => r.id)).toEqual([roleB.id])

    expect(result[3].start).toEqual(new Date("2024-04-01"))
    expect(result[3].end).toEqual(new Date("2024-05-01"))
    expect(new Set(result[3].roles.map((r) => r.id))).toEqual(new Set([roleB.id, roleC.id]))

    expect(result[4].start).toEqual(new Date("2024-05-01"))
    expect(result[4].end).toEqual(new Date("2024-06-01"))
    expect(result[4].roles.map((r) => r.id)).toEqual([roleC.id])
  })
})
