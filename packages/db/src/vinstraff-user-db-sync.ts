/**
 * Syncs Users, Memberships, Groups, GroupRoles, GroupMemberships, and GroupMembershipRoles
 * from production database to local database for vinstraff (penalty wine) functionality.
 *
 * Usage: doppler run --config prd --project monoweb-rpc -- pnpm vinstraff:user-db-sync
 *
 * This script:
 * 1. Connects to prod via DATABASE_URL (provided by Doppler)
 * 2. Connects to local DB via LOCAL_DATABASE_URL (defaults to docker-compose setup)
 * 3. Fetches and upserts all relevant data
 */

import { createPrisma } from "."

const PROD_DATABASE_URL = process.env.DATABASE_URL
const LOCAL_DATABASE_URL = process.env.LOCAL_DATABASE_URL ?? "postgresql://ow:owpassword123@localhost:4010/ow"

if (!PROD_DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Run this script with Doppler: doppler run --config prd --project monoweb-rpc -- pnpm vinstraff:user-db-sync"
  )
}

if (PROD_DATABASE_URL === LOCAL_DATABASE_URL) {
  throw new Error("DATABASE_URL and LOCAL_DATABASE_URL are the same. This would sync prod to itself.")
}

if (!PROD_DATABASE_URL.includes("prod") && !PROD_DATABASE_URL.includes("prd")) {
  console.warn(
    "Warning: DATABASE_URL does not contain 'prod' or 'prd'. Make sure you're connecting to the right database."
  )
}

console.log("Connecting to production database...")
const prodDb = createPrisma(PROD_DATABASE_URL)

console.log("Connecting to local database...")
const localDb = createPrisma(LOCAL_DATABASE_URL)

console.log("Fetching data from production...")

// Fetch all data from production
const [users, memberships, groups, groupRoles, groupMemberships, groupMembershipRoles] = await Promise.all([
  prodDb.user.findMany(),
  prodDb.membership.findMany(),
  prodDb.group.findMany(),
  prodDb.groupRole.findMany(),
  prodDb.groupMembership.findMany(),
  prodDb.$queryRaw<
    Array<{ membership_id: string; role_id: string }>
  >`SELECT membership_id, role_id FROM group_membership_role`,
])

console.log(`Found ${users.length} users`)
console.log(`Found ${memberships.length} memberships`)
console.log(`Found ${groups.length} groups`)
console.log(`Found ${groupRoles.length} group roles`)
console.log(`Found ${groupMemberships.length} group memberships`)
console.log(`Found ${groupMembershipRoles.length} group membership roles`)

console.log("\nClearing local database...")

// Use TRUNCATE CASCADE to handle all foreign key dependencies
await localDb.$executeRaw`TRUNCATE TABLE ow_user CASCADE`
console.log("Cleared ow_user (and all dependent tables)")
await localDb.$executeRaw`TRUNCATE TABLE "group" CASCADE`
console.log("Cleared group (and all dependent tables)")

console.log("\nInserting production data...")

// Insert in dependency order
// 1. Users first (no dependencies)
console.log("Inserting users...")
await localDb.user.createMany({ data: users })
console.log(`Inserted ${users.length} users`)

// 2. Memberships (depends on users)
console.log("Inserting memberships...")
await localDb.membership.createMany({ data: memberships })
console.log(`Inserted ${memberships.length} memberships`)

// 3. Groups (no dependencies)
console.log("Inserting groups...")
await localDb.group.createMany({ data: groups })
console.log(`Inserted ${groups.length} groups`)

// 4. GroupRoles (depends on groups)
console.log("Inserting group roles...")
await localDb.groupRole.createMany({ data: groupRoles })
console.log(`Inserted ${groupRoles.length} group roles`)

// 5. GroupMemberships (depends on users and groups)
console.log("Inserting group memberships...")
await localDb.groupMembership.createMany({ data: groupMemberships })
console.log(`Inserted ${groupMemberships.length} group memberships`)

// 6. GroupMembershipRoles (depends on group memberships and group roles)
console.log("Inserting group membership roles...")
for (const gmr of groupMembershipRoles) {
  await localDb.$executeRaw`INSERT INTO group_membership_role (membership_id, role_id) VALUES (${gmr.membership_id}, ${gmr.role_id})`
}
console.log(`Inserted ${groupMembershipRoles.length} group membership roles`)

// Clear workspace IDs since local environment doesn't have Google Workspace integration
// Without this, the dashboard will try to call workspace APIs that aren't available locally
console.log("\nClearing workspace IDs (not available locally)...")
await localDb.user.updateMany({ data: { workspaceUserId: null } })
console.log("Cleared workspaceUserId from all users")
await localDb.group.updateMany({ data: { workspaceGroupId: null } })
console.log("Cleared workspaceGroupId from all groups")

console.log("\nSync complete!")

await prodDb.$disconnect()
await localDb.$disconnect()
