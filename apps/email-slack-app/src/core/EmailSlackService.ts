import type { SlackClient } from "./SlackClient"
import type { GmailServiceImpl } from "./gmail/GmailService"

export class EmailSlackService {
  constructor(
    private readonly slackClient: SlackClient,
    private readonly gmailClient: GmailServiceImpl
  ) {}

  async processPending(
    labelName: string,
    slackChannelId: string,
    blockedSenders: string[],
    blockedReceivers: string[]
  ): Promise<void> {
    const label = await this.gmailClient.getLabel(labelName)
    if (label === null) {
      throw new Error(`Label not found: ${labelName}`)
    }

    const pendingMessages = await this.gmailClient.findMessages({
      labels: [label.name],
    })

    for (const message of pendingMessages.reverse()) {
      if (!message.from || !message.to || !message.subject || !message.body.text) {
        console.log("Validation failed", { message })
        continue
      }

      // 'Domeneshop' via Dotkom" <dotkom@online.ntnu.no> -> dotkom@online.ntnu.no
      // const senderEmail = this.emailParser.parseEmail(message.from || "");
      // const receiverEmail = this.emailParser.parseEmail(message.to || "");

      if (blockedReceivers.includes(message.from)) {
        console.log(`Blocked message from: ${message.from}`)
        continue
      }

      if (blockedSenders.includes(message.from)) {
        console.log(`Blocked message to: ${message.from}`)
        continue
      }

      const cleanedMessage = this.cleanMessage(message.body.text)
      const cleanedMailTitle = this.cleanMessage(message.subject)

      console.log("Processed email and sending to slack", {
        title: cleanedMailTitle,
        sender: message.from,
        receiver: message.to,
      })

      // Add to Slack
      await this.addToSlack(slackChannelId, cleanedMailTitle, message.from, message.to, cleanedMessage)

      // Remove label from processed mail
      await this.gmailClient.removeLabel(message.messageId, label.id)
      console.log("Removed label: ", label.name)
    }
  }

  async addToSlack(
    slackChannelId: string,
    title: string,
    sender: string,
    receiver: string,
    message: string
  ): Promise<void> {
    const msg1 = {
      text: `*Fra: ${sender}*\n*Til: ${receiver}*\n*Emne: ${title}*`,
    }

    const msg1resp = await this.slackClient.sendMessage(slackChannelId, msg1)
    if (!msg1resp.ok) {
      return
    }

    const msg2 = {
      attachments: [
        {
          text: message,
        },
      ],
    }

    await this.slackClient.sendMessage(slackChannelId, msg2, msg1resp.ts)
  }

  private cleanMessage(message: string): string {
    return message.replace(/\"+/g, "")
  }
}
