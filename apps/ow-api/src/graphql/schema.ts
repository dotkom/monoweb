import { makeSchema } from "nexus"
import path from "path"
import * as AuthSchema from "../modules/auth/graphql"

const __dirname = path.dirname(new URL(import.meta.url).pathname)

const graphqlSchema = makeSchema({
  types: [AuthSchema],
  outputs: {
    schema: path.join(__dirname, ".generated/schema.graphql"),
    typegen: path.join(__dirname, ".generated/nexus-typegen.ts"),
  },
  nonNullDefaults: {
    output: true,
    input: true,
  },
  contextType: {
    module: path.join(__dirname, "context.ts"),
    export: "Context",
    alias: "ctx",
  },
})

export default graphqlSchema
