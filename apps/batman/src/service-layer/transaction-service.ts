import { Email, Transaction, TransactionSchema } from "./domain"
import { GmailService } from "./gmail-service"
import { StateService } from "./state-service"

export interface TransactionService {
  handleNewTransactions(newHistoryId: string, num: number): Promise<Transaction[]>
  syncTransactions(num: number): Promise<Transaction[]>
}

export class TransactionServiceImpl implements TransactionService {
  constructor(
    private readonly gmailService: GmailService,
    private readonly stateService: StateService,
    private readonly gmailLabelId: string
  ) {}

  async syncTransactions(num: number): Promise<Transaction[]> {
    const newestEmails = await this.gmailService.getNewestEmails(num, [this.gmailLabelId])
    const transactions = newestEmails.map((email) => this.extractEmailInfo(email))
    const saved = this.stateService.setTransactionList(transactions)
    return saved
  }

  async handleNewTransactions(newHistoryId: string, num: number): Promise<Transaction[]> {
    const state = await this.stateService.getFullState()

    const lastHistoryId = state.lastHistoryId

    if (!lastHistoryId) {
      this.stateService.setLastProcessedHistoryId(newHistoryId)
      const transactions = this.syncTransactions(num)
      return transactions
    }

    const unprocessedEmails = []

    try {
      const res = await this.gmailService.getHistory(lastHistoryId, this.gmailLabelId)
      unprocessedEmails.push(...res)
    } catch (e) {
      console.error(`Error fetching history since ${lastHistoryId}`, e)
      this.stateService.setLastProcessedHistoryId(newHistoryId)
      return state.transactions
    }

    const newTransactions = unprocessedEmails.map((email) => this.extractEmailInfo(email))
    console.log("New transactions")
    console.log(JSON.stringify(newTransactions, null, 2))

    // remove duplicates and add to state
    for (const transaction of newTransactions) {
      if (!state.transactions.find((t) => t.orderNumber === transaction.orderNumber)) {
        state.transactions.push(transaction)
      }
    }

    state.transactions.sort((a, b) => Number(b.orderNumber) - Number(a.orderNumber))

    console.log("Final transactions after sorting")
    console.log(JSON.stringify(state.transactions, null, 2))

    const updatedTransactions = this.stateService.setTransactionList(state.transactions)
    await this.stateService.setLastProcessedHistoryId(newHistoryId)
    return updatedTransactions
  }

  extractEmailInfo(email: Email): Transaction {
    // body: 'Hei Online Linjeforeningen for Informatikk,\r\n' +
    // '\r\n' +
    // 'Det har kommet inn en ny ordre via TidypayGO - her er detaljene:\r\n' +
    // '\r\n' +
    // '\r\n' +
    // 'Ordrenummer:\t15708\r\n' +
    // 'Fakturanummer:\t16313\r\n' +
    // 'Dato og tid:\t2024-04-07 20:10:31\r\n' +
    // '\r\n' +
    // '\r\n' +
    // 'Kunde:\tHenrik Johannes Bjørnstad Skog ( henrikskog01@gmail.com  / 4745871936 )\r\n' +
    // '\r\n' +
    // '\r\n' +
    // '\t1 stk Tregaffel á kr 1.00 = kr 1.00\r\n' +
    // '\t2 stk Tregaffel á kr 1.00 = kr 1.00\r\n' +
    // '\r\n' +
    // 'Sum ordre ink MVA kr 1.00\r\n' +
    // 'Herav MVA kr 0.00\r\n' +
    // '\r\n' +
    // 'Denne e-posten er sendt fra Tidypay (tidypay.no).\r\n' +
    // '\r\n' +
    // '\r\n',
    // const orderNumberMatch = email.body.match(/Ordrenummer:\s+(\d+)/)
    // const invoiceNumberMatch = email.body.match(/Fakturanummer:\s+(\d+)/)
    // const nameEmailMatch = email.body.match(/Kunde:\s+(.*?)\s+\(\s*(.*?)\s*\//)
    // const amountMatch = email.body.match(/Sum ordre ink MVA kr\s+(\d+.\d+)/)
    // const transactionDescriptionMatch = email.body.match(/(.*stk.*kr.*)/)

    // console.log(transactionDescriptionMatch)

    // const orderNumber = orderNumberMatch ? orderNumberMatch[1] : ""
    // const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : ""
    // const name = nameEmailMatch ? nameEmailMatch[1] : ""
    // const emailAddr = nameEmailMatch ? nameEmailMatch[2] : ""
    // const amount = amountMatch ? parseInt(amountMatch[1], 10) : 0 // Note: This might need adjustment for handling floats
    // let transactionDescription = transactionDescriptionMatch ? transactionDescriptionMatch[0] : "" // Note: Adjust based on actual needs

    // // strip it
    // transactionDescription = transactionDescription.replace(/\r\n/g, "")

    const body = email.body

    // remove all newlines from body
    const bodyNoNewlines = body.split("\r\n")

    let orderNumber = ""
    let invoiceNumber = ""
    let name = ""
    let emailAddr = ""
    let amount = 0
    const transactions = []

    for (let i = 0; i < bodyNoNewlines.length; i++) {
      const line = bodyNoNewlines[i]

      if (line.startsWith("Ordrenummer:")) {
        orderNumber = line.split("\t")[1].trim()
      } else if (line.startsWith("Fakturanummer:")) {
        invoiceNumber = line.split("\t")[1].trim()
      } else if (line.startsWith("Kunde:")) {
        const customerInfo = line.split(":")[1].trim()
        const [customerName, rest] = customerInfo.split("(")
        name = customerName.trim()
        emailAddr = rest.split("/")[0].trim()
      } else if (line.startsWith("Sum ordre ink MVA kr")) {
        amount = parseFloat(line.split("kr")[1].trim())
      } else if (line.includes("= kr")) {
        transactions.push(line.trim())
      }
    }

    const transaction = {
      orderNumber,
      name,
      email: emailAddr,
      amount,
      datetime: email.date,
      transactionDescription: transactions.join("\n"),
      invoiceNumber,
      historyId: email.historyId,
      emailId: email.emailId,
    }

    return TransactionSchema.parse(transaction)
  }
}
