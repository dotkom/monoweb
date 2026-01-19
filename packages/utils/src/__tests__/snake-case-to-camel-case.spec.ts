import { describe, it, expect } from "vitest"
import { snakeCaseToCamelCase } from "../snake-case-to-camel-case"

class PrismaDecimalMock {
  public value: string

  constructor(value: string) {
    this.value = value
  }
}

describe("snakeCaseToCamelCase", () => {
  describe("Basic transformation", () => {
    it("convert simple snake_case keys to camelCase", () => {
      const input = {
        first_name: "John",
        is_active_user: true,
        account_id: 123,
      }
      const expected = {
        firstName: "John",
        isActiveUser: true,
        accountId: 123,
      }
      expect(snakeCaseToCamelCase(input)).toEqual(expected)
    })

    it("leaves already camelCase keys alone", () => {
      const input = { firstName: "John" }
      expect(snakeCaseToCamelCase(input)).toEqual(input)
    })

    it("leaves single word keys alone", () => {
      const input = { id: 1, name: "test" }
      expect(snakeCaseToCamelCase(input)).toEqual(input)
    })
  })

  describe("Recursion", () => {
    it("converts nested objects", () => {
      const input = {
        user_profile: {
          first_name: "Jane",
          contact_info: {
            phone_number: "555-0199",
          },
        },
      }
      const expected = {
        userProfile: {
          firstName: "Jane",
          contactInfo: {
            phoneNumber: "555-0199",
          },
        },
      }
      expect(snakeCaseToCamelCase(input)).toEqual(expected)
    })

    it("converts objects inside arrays", () => {
      const input = [
        { item_id: 1, item_name: "Apple" },
        { item_id: 2, item_name: "Banana" },
      ]
      const expected = [
        { itemId: 1, itemName: "Apple" },
        { itemId: 2, itemName: "Banana" },
      ]
      expect(snakeCaseToCamelCase(input)).toEqual(expected)
    })
  })

  describe("Object preservation", () => {
    it("preserves Date objects", () => {
      const date = new Date()
      const input = { created_at: date }
      const output = snakeCaseToCamelCase(input)

      expect(output.createdAt).toBeInstanceOf(Date)
      expect(output.createdAt).toBe(date)
    })

    it("preserves Buffers", () => {
      const buffer = Buffer.from("hello")
      const input = { file_data: buffer }
      const output = snakeCaseToCamelCase(input)

      expect(Buffer.isBuffer(output.fileData)).toBe(true)
      expect(output.fileData).toEqual(buffer)
    })

    it("preserves custom classes (e.g. from Prisma)", () => {
      const decimal = new PrismaDecimalMock("10.55")
      const input = { amount_due: decimal }
      const output = snakeCaseToCamelCase(input)

      // It should NOT try to traverse the PrismaDecimalMock object
      expect(output.amountDue).toBeInstanceOf(PrismaDecimalMock)
      expect(output.amountDue).toEqual(decimal)
    })

    it("preserves arrays of primitives", () => {
      const input = { tags_list: ["a", "b", "c"] }
      expect(snakeCaseToCamelCase(input)).toEqual({ tagsList: ["a", "b", "c"] })
    })
  })

  describe("Regex edge cases", () => {
    it("preserves leading underscores (e.g. Prisma aggregates, _id)", () => {
      const input = {
        _count: 10,
        _id: "mongo_id",
        _internal_value: true,
      }
      const expected = {
        _count: 10,
        _id: "mongo_id",
        _internalValue: true,
      }
      expect(snakeCaseToCamelCase(input)).toEqual(expected)
    })

    it("handles double underscores correctly", () => {
      // Depending on strictness, usually we want to ignore double underscores or treat them as a single separator.
      // The regex /([^_])_([a-z])/ requires a char, an underscore, a letter.
      // "two__underscores": 'o' is char, '_' is underscore, '_' is NOT [a-z].
      // So no match.
      const input = { two__underscores: true }
      expect(snakeCaseToCamelCase(input)).toEqual({ two__underscores: true })
    })

    it("handles double underscores with single underscore correctly", () => {
      const input = { two__underscores_one_underscore: true }
      expect(snakeCaseToCamelCase(input)).toEqual({ two__underscoresOneUnderscore: true })
    })

    it("handles trailing underscores", () => {
      // "prop_": '_' is not [a-z], so no match.
      const input = { prop_: true }
      expect(snakeCaseToCamelCase(input)).toEqual({ prop_: true })
    })

    it("handles keys with numbers", () => {
      // "address_1": '1' is not [a-z], no match.
      // "ipv4_address": '4' is not _, matches standard.
      const input = { address_1: "Trondheim", ipv4_address: "127.0.0.1" }
      expect(snakeCaseToCamelCase(input)).toEqual({
        address_1: "Trondheim",
        ipv4Address: "127.0.0.1",
      })
    })
  })

  describe("Primitives and nulls", () => {
    it("returns null as is", () => {
      expect(snakeCaseToCamelCase(null)).toBe(null)
    })

    it("returns undefined as is", () => {
      expect(snakeCaseToCamelCase(undefined)).toBe(undefined)
    })

    it("returns strings/numbers as is", () => {
      expect(snakeCaseToCamelCase("hello_world")).toBe("hello_world")
      expect(snakeCaseToCamelCase(123)).toBe(123)
    })
  })

  describe("Native classes and special types", () => {
    it("ignores Maps", () => {
      // Even if the Map has snake_case keys, we shouldn't touch internal Map logic
      // unless we explicitly wrote logic to iterate .entries()
      const map = new Map()
      map.set("snake_key", "value")

      const result = snakeCaseToCamelCase(map)

      expect(result).toBeInstanceOf(Map)
      expect(result).toBe(map) // Reference equality check
      expect(result.get("snake_key")).toBe("value")
    })

    it("ignores Sets", () => {
      const set = new Set(["snake_case_value"])
      const result = snakeCaseToCamelCase(set)

      expect(result).toBeInstanceOf(Set)
      expect(result).toBe(set)
      expect(result.has("snake_case_value")).toBe(true)
    })

    it("ignores TypedArrays (Int8Array, Uint8Array, etc)", () => {
      // These are often used for binary data, similar to Buffer
      const array = new Uint8Array([1, 2, 3])
      const result = snakeCaseToCamelCase(array)

      expect(result).toBeInstanceOf(Uint8Array)
      expect(result).toBe(array)
    })

    it("ignores Regex", () => {
      const regex = /my_regex/g
      const result = snakeCaseToCamelCase(regex)
      expect(result).toBe(regex)
    })

    it("ignores Errors", () => {
      const err = new Error("some_error")
      const result = snakeCaseToCamelCase(err)
      expect(result).toBe(err)
    })
  })
})
