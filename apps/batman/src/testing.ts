import { createServiceLayer } from "./service-layer"

createServiceLayer().then(async (core) => {
  // const newestEmails = await core.gmailService.getNewestEmails(1, ["Label_661192541137989669"])
  // console.log(newestEmails)
  // const res = core.transactionService.extractEmailInfo(newestEmails[0])
  // console.log(res)
  // console.log(await core.stateService._updateProperty("lastHistoryId", null))
  // console.log(await core.stateService._updateProperty("transactions", []))
  // console.log(await core.stateService._updateProperty("socketConnectionIds", []))

  // get full state
  // sync 10
  // const state = await core.transactionService.syncTransactions(10)
  // console.log(state)

  const res = await core.gmailService.watch()
  console.log(res)
})
