import { migrator } from "@dotkomonline/db"

const res = await migrator.migrateToLatest()
console.log(res)

process.exit()
