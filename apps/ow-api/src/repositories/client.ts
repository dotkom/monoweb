import { initPostgres } from "../database/postgres"

const prisma = await initPostgres()
export default prisma
