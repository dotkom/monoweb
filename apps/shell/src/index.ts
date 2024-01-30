import { writeFileSync } from "fs"
import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"
// import { CognitoIDPRepositoryImpl } from "@dotkomonline/core/src/lib/IDP-repository"

createServiceLayer({ db: kysely }).then(async (core) => {
  const attendance = await core.eventService.listAttendance("01HB64TWZK1C5YK5J7VGNZPDGW")
  console.log("finished")

  //   write to json file
  writeFileSync("attendance.json", JSON.stringify(attendance, null, 2))
})

// const idp = new CognitoIDPRepositoryImpl()
