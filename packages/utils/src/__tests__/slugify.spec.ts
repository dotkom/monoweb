import { expect, it } from "vitest"
import { slugify } from "../slugify"

it("handles basic text with spaces", () => {
  expect(slugify("Hello World")).toMatchInlineSnapshot(`"Hello_World"`)
  expect(slugify("Multiple   Spaces   Here")).toMatchInlineSnapshot(`"Multiple_Spaces_Here"`)
})

it("handles special characters", () => {
  expect(slugify("Hello! World?")).toMatchInlineSnapshot(`"Hello!_World"`)
  expect(slugify("Special@#$%^&*()")).toMatchInlineSnapshot(`"Special@dollarpercentand*()"`)
  expect(slugify("Comma,Dot.Semicolon;")).toMatchInlineSnapshot(`"CommaDot.Semicolon"`)
})

it("handles numbers and mixed content", () => {
  expect(slugify("Hello123")).toMatchInlineSnapshot(`"Hello123"`)
  expect(slugify("123Hello")).toMatchInlineSnapshot(`"123Hello"`)
  expect(slugify("Mix3d Numb3rs")).toMatchInlineSnapshot(`"Mix3d_Numb3rs"`)
})

it("handles accents and diacritics", () => {
  expect(slugify("café")).toMatchInlineSnapshot(`"cafe"`)
  expect(slugify("über")).toMatchInlineSnapshot(`"uber"`)
  expect(slugify("piñata")).toMatchInlineSnapshot(`"pinata"`)
})

it("handles case sensitivity", () => {
  expect(slugify("UPPERCASE")).toMatchInlineSnapshot(`"UPPERCASE"`)
  expect(slugify("lowercase")).toMatchInlineSnapshot(`"lowercase"`)
  expect(slugify("MiXeDcAsE")).toMatchInlineSnapshot(`"MiXeDcAsE"`)
})

it("handles Norwegian characters", () => {
  expect(slugify("ærlig")).toMatchInlineSnapshot(`"aerlig"`)
  expect(slugify("blåbær")).toMatchInlineSnapshot(`"blabaer"`)
  expect(slugify("kølle")).toMatchInlineSnapshot(`"kolle"`)
  expect(slugify("Ålesund")).toMatchInlineSnapshot(`"Alesund"`)
  expect(slugify("smørbrød")).toMatchInlineSnapshot(`"smorbrod"`)
})
