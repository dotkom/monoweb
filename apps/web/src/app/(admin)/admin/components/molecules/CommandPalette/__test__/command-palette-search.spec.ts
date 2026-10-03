import { describe, expect, it } from "vitest"
import { searchItems, type SearchItem } from "../command-palette-search"
import { containsQuery } from "../use-command-palette-items"

const mockIcon = (() => null) as unknown as SearchItem["icon"]

function item(partial: Pick<SearchItem, "id" | "kind" | "label"> & Partial<SearchItem>): SearchItem {
  return { href: "/", keywords: [], icon: mockIcon, ...partial }
}

function ids(items: SearchItem[]) {
  return items.map((row) => row.id)
}

describe("searchItems", () => {
  it("returns only pages and actions when the query is empty", () => {
    const items = [
      item({ id: "page", kind: "page", label: "Arrangementer" }),
      item({ id: "action", kind: "action", label: "Nytt arrangement" }),
      item({ id: "resource", kind: "resource", label: "ITEX" }),
    ]

    expect(ids(searchItems("", items))).toEqual(["page", "action"])
    expect(ids(searchItems("   ", items))).toEqual(["page", "action"])
  })

  it("drops an item when any query word matches nothing", () => {
    const items = [
      item({
        id: "dotkom",
        kind: "resource",
        label: "Drifts- og utviklingskomiteen",
        keywords: ["dotkom"],
      }),
    ]

    expect(ids(searchItems("appkom", items))).toEqual([])
    expect(ids(searchItems("dotkom mangler", items))).toEqual([])
  })

  it("matches when every query word hits some label or keyword word, in any order", () => {
    const items = [
      item({
        id: "nytt-arrangement",
        kind: "action",
        label: "Nytt arrangement",
        keywords: ["ny arrangement"],
      }),
    ]

    expect(ids(searchItems("arr ny", items))).toEqual(["nytt-arrangement"])
    expect(ids(searchItems("  ny   arr  ", items))).toEqual(["nytt-arrangement"])
  })

  it("does not treat a shorter word as a match for a longer query word", () => {
    const items = [
      item({
        id: "nytt-arrangement",
        kind: "action",
        label: "Nytt arrangement",
        keywords: ["ny arrangement"],
      }),
      item({ id: "page", kind: "page", label: "Arrangementer", keywords: ["arrangement"] }),
    ]

    expect(ids(searchItems("arrangementer ny", items))).toEqual([])
    expect(ids(searchItems("arrangementer", items))).toEqual(["page"])
  })

  it("ignores case and punctuation on the edges of a word", () => {
    const items = [item({ id: "itex-event", kind: "resource", label: "(ITEX) kveldsarrangement" })]

    expect(ids(searchItems("itex", items))).toEqual(["itex-event"])
    expect(ids(searchItems("ITEX", items))).toEqual(["itex-event"])
    expect(ids(searchItems("(itex)", items))).toEqual(["itex-event"])
  })

  it("matches a keyword when the label does not", () => {
    const items = [
      item({
        id: "user",
        kind: "resource",
        label: "Ola Nordmann",
        keywords: ["ola.nordmann@online.ntnu.no"],
      }),
    ]

    expect(ids(searchItems("ola.nordmann@online.ntnu.no", items))).toEqual(["user"])
    expect(ids(searchItems("ola.nordmann@", items))).toEqual(["user"])
    expect(ids(searchItems("online", items))).toEqual([])
  })

  it("ranks an exact label above a prefix", () => {
    const items = [
      item({ id: "itex-event", kind: "resource", label: "(ITEX) kveldsarrangement med twoday" }),
      item({ id: "itex-group", kind: "resource", label: "ITEX" }),
    ]

    expect(ids(searchItems("itex", items))).toEqual(["itex-group", "itex-event"])
  })

  it("ranks an exact resource id above an exact label", () => {
    const items = [
      item({ id: "by-id", kind: "resource", label: "A completely different title", resourceId: "itex" }),
      item({ id: "exact", kind: "resource", label: "ITEX" }),
    ]

    expect(ids(searchItems("itex", items))).toEqual(["by-id", "exact"])
  })

  it("always ranks items in order of pages > actions > resources", () => {
    const items = [
      item({ id: "resource", kind: "resource", label: "Arrangement" }),
      item({ id: "action", kind: "action", label: "Arrangement" }),
      item({ id: "page", kind: "page", label: "Arrangement" }),
    ]

    expect(ids(searchItems("arrangement", items))).toEqual(["page", "action", "resource"])
  })

  it("keeps input order for pages when score is equal", () => {
    const items = [
      item({ id: "arrangementer", kind: "page", label: "Arrangementer" }),
      item({ id: "arrkom", kind: "page", label: "Arrkom" }),
    ]

    expect(ids(searchItems("arr", items))).toEqual(["arrangementer", "arrkom"])
  })

  it("ranks a shorter resource title first when score is equal", () => {
    const items = [
      item({ id: "long", kind: "resource", label: "Foobar extra" }),
      item({ id: "short", kind: "resource", label: "Foobaz" }),
      item({ id: "same-a", kind: "resource", label: "Fooone" }),
      item({ id: "same-b", kind: "resource", label: "Footwo" }),
    ]

    expect(ids(searchItems("foo", items))).toEqual(["short", "same-a", "same-b", "long"])
  })

  it("does not match inside a later part of a word", () => {
    const items = [
      item({ id: "itex-group", kind: "resource", label: "ITEX" }),
      item({ id: "itex-event", kind: "resource", label: "(ITEX) kveldsarrangement med twoday" }),
      item({ id: "dotkom", kind: "resource", label: "Drifts- og utviklingskomiteen", keywords: ["dotkom"] }),
      item({ id: "arrangement", kind: "resource", label: "Arrangement" }),
    ]

    expect(ids(searchItems("ite", items))).toEqual(["itex-group", "itex-event"])
    expect(ids(searchItems("ment", items))).toEqual([])
    expect(ids(searchItems("drifts", items))).toEqual(["dotkom"])
  })

  it("does not split a hyphenated id into query words", () => {
    const uuid = "a1b2c3d4-1111-4111-8111-111111111111"
    const items = [
      item({
        id: "offline-1",
        kind: "resource",
        label: "Offline 2024",
        keywords: ["Offline 2024", uuid],
        resourceId: uuid,
      }),
    ]

    expect(ids(searchItems("offline 1", items))).toEqual([])
    expect(ids(searchItems("1111", items))).toEqual([])
    expect(ids(searchItems(uuid, items))).toEqual(["offline-1"])
  })
})

it("keeps score 0 rows after matches, in input order", () => {
  const items = [
    item({ id: "long-miss", kind: "resource", label: "A very long event title" }),
    item({ id: "exact", kind: "resource", label: "ITEX" }),
    item({ id: "short-miss", kind: "resource", label: "AB" }),
    item({
      id: "user",
      kind: "resource",
      label: "Ola Nordmann",
      keywords: ["ola.nordmann@online.ntnu.no"],
    }),
  ]

  expect(ids(searchItems("itex", items, { keepNonMatches: true }))).toEqual([
    "exact",
    "long-miss",
    "short-miss",
    "user",
  ])
  expect(ids(searchItems("online", items))).toEqual([])
  expect(ids(searchItems("online", items, { keepNonMatches: true }))).toEqual([
    "long-miss",
    "exact",
    "short-miss",
    "user",
  ])
})

it("ranks a page above a resource even when the resource scores higher", () => {
  const items = [
    item({ id: "by-id", kind: "resource", label: "A completely different title", resourceId: "itex" }),
    item({ id: "page", kind: "page", label: "ITEX-hjelp" }),
  ]

  expect(ids(searchItems("itex", items))).toEqual(["page", "by-id"])
})

describe("containsQuery", () => {
  it("keeps a previous row only when the whole query is a substring", () => {
    const job = item({ id: "job", kind: "resource", label: "Nyutdannet utvikler" })
    const user = item({
      id: "user",
      kind: "resource",
      label: "Olá Nordmann",
      keywords: ["ola.nordmann@online.ntnu.no"],
    })

    expect(containsQuery(job, "ny")).toBe(true)
    expect(containsQuery(job, "ny j")).toBe(false)
    expect(containsQuery(user, "ola")).toBe(true)
    expect(containsQuery(user, "ola n")).toBe(false)
    expect(containsQuery(user, "Olá N")).toBe(true)
  })
})
