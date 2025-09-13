import { expect, it } from "vitest"
import { slugify } from "../slugify.ts"

it("Adequately slugifies some event titles", () => {
  expect(slugify("17. mai frokost")).toMatchInlineSnapshot(`"17-mai-frokost"`)
  expect(slugify("[Ekskom] Generalforsamling - Vår 2025")).toMatchInlineSnapshot(`"ekskom-generalforsamling-var-2025"`)

  // => we prefer using lower case, easier to read when it's all lowercase IMO
})

it("handles basic text with spaces", () => {
  expect(slugify("Hello World")).toMatchInlineSnapshot(`"hello-world"`)
  expect(slugify("Multiple   Spaces   Here")).toMatchInlineSnapshot(`"multiple-spaces-here"`)
})

it("handles special characters", () => {
  expect(slugify("Hello! World?")).toMatchInlineSnapshot(`"hello-world"`)
  expect(slugify("Special@#$%^&*()")).toMatchInlineSnapshot(`"specialdollarpercentand"`)
  expect(slugify("Comma,Dot.Semicolon;")).toMatchInlineSnapshot(`"commadotsemicolon"`)
})

it("handles numbers and mixed content", () => {
  expect(slugify("Hello123")).toMatchInlineSnapshot(`"hello123"`)
  expect(slugify("123Hello")).toMatchInlineSnapshot(`"123hello"`)
  expect(slugify("Mix3d Numb3rs")).toMatchInlineSnapshot(`"mix3d-numb3rs"`)
})

it("handles accents and diacritics", () => {
  expect(slugify("café")).toMatchInlineSnapshot(`"cafe"`)
  expect(slugify("über")).toMatchInlineSnapshot(`"uber"`)
  expect(slugify("piñata")).toMatchInlineSnapshot(`"pinata"`)
})

it("handles case sensitivity", () => {
  expect(slugify("UPPERCASE")).toMatchInlineSnapshot(`"uppercase"`)
  expect(slugify("lowercase")).toMatchInlineSnapshot(`"lowercase"`)
  expect(slugify("MiXeDcAsE")).toMatchInlineSnapshot(`"mixedcase"`)
})

it("handles Norwegian characters", () => {
  expect(slugify("ærlig")).toMatchInlineSnapshot(`"aerlig"`)
  expect(slugify("blåbær")).toMatchInlineSnapshot(`"blabaer"`)
  expect(slugify("kølle")).toMatchInlineSnapshot(`"kolle"`)
  expect(slugify("Ålesund")).toMatchInlineSnapshot(`"alesund"`)
  expect(slugify("smørbrød")).toMatchInlineSnapshot(`"smorbrod"`)
})
