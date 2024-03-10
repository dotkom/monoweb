import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"
// import { CognitoIDPRepositoryImpl } from "@dotkomonline/core/src/lib/IDP-repository"

createServiceLayer({ db: kysely }).then(async (core) => {
  const test = await core.auth0Repository.getBySubject("auth0|61ea20bf-6964-4484-b7b8-e81952601111")
  console.log(test)
})
