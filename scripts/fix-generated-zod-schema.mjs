import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

// prisma-zod-generator (with `zodImportTarget: "v4"`) emits recursive input
// schemas through a factory that is invoked eagerly:
//
//   const __makeSchema_FooWhereInput_schema = () => z.object({
//     AND: z.union([FooWhereInputObjectSchema, FooWhereInputObjectSchema.array()]).optional(),
//     get OR(){ return FooWhereInputObjectSchema.array().optional(); },
//     bar: z.union([BarScalarRelationFilterObjectSchema, BarWhereInputObjectSchema]).optional(),
//     ...
//   }).strict();
//   export const FooWhereInputObjectSchema = __makeSchema_FooWhereInput_schema();
//   export const FooWhereInputObjectZodSchema = __makeSchema_FooWhereInput_schema();
//
// The factory runs while `FooWhereInputObjectSchema` (and every other object
// schema declared later in the single-file output) is still in its temporal
// dead zone. The generator's own getters do not help here because the eagerly
// invoked `.strict()` reads the object shape immediately, which evaluates those
// getters during the dead zone. The result is
// "ReferenceError: Cannot access 'X' before initialization" at module load
// (see omar-dulaimi/prisma-zod-generator#377).
//
// Wrapping each eager factory call in `z.lazy(...)` defers the entire factory
// (including `.strict()` shape evaluation) until the schema is first used, by
// which point every referenced const has been initialized. `z.lazy` preserves
// the strict-object parsing behaviour. The transform is idempotent because the
// rewritten reference is no longer a call expression.

const targetPath = resolve(process.argv[2] ?? "generated/schema/index.ts")
const source = readFileSync(targetPath, "utf8")
const lineEnding = source.includes("\r\n") ? "\r\n" : "\n"

const eagerFactoryCallPattern = /\b(__makeSchema_\w+_schema)\(\)/g
let rewrittenCallCount = 0

const withLazyFactories = source.replace(eagerFactoryCallPattern, (_match, factoryName) => {
  rewrittenCallCount += 1
  return `z.lazy(${factoryName})`
})

const alreadyHasHeader = withLazyFactories.startsWith("// @ts-nocheck")
const output = alreadyHasHeader ? withLazyFactories : `// @ts-nocheck${lineEnding}${withLazyFactories}`

writeFileSync(targetPath, output)

console.log(`Wrapped ${rewrittenCallCount} eager schema factory call(s) in z.lazy() in ${targetPath}`)
