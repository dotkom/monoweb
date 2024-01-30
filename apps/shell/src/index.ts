// import { createServiceLayer } from "@dotkomonline/core"
// import { kysely } from "@dotkomonline/db"
import { CognitoIDPRepositoryImpl } from "@dotkomonline/core/src/lib/IDP-repository"

// const core = await createServiceLayer({ db: kysely })

const idp = new CognitoIDPRepositoryImpl()

idp.search("henrik", 10).then(console.log)
