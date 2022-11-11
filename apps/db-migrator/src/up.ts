import { migrator } from "@dotkomonline/db"

const res = await migrator.migrateUp()
console.log(res)

process.exit()
