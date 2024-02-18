import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"
// import { CognitoIDPRepositoryImpl } from "@dotkomonline/core/src/lib/IDP-repository"

createServiceLayer({ db: kysely }).then(async (core) => {
  const attendance = await core.auth0IDPRepositoryImpl.search("hen", 10)

  console.log(attendance)

  //   write to json file
  // writeFileSync("attendance.json", JSON.stringify(attendance, null, 2))
})

// const idp = new CognitoIDPRepositoryImpl()
