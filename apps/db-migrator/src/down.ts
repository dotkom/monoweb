import { migrator } from "@dotkomonline/db"

const res = await migrator.migrateDown()
console.log(res)

process.exit()
