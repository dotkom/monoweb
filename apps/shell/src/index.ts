// import { createServiceLayer } from "@dotkomonline/core"
// import { kysely } from "@dotkomonline/db"
import { CognitoIDPRepositoryImpl } from "@dotkomonline/core/src/lib/IDP-repository"

// const core = await createServiceLayer({ db: kysely })

const idp = new CognitoIDPRepositoryImpl()

// idp.getAll(10).then(console.log)
idp.getBySubject("20fd4962-466e-4fd5-9cc1-cca586caa04e").then(console.log)
