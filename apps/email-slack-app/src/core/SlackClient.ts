import axios from "axios"

type MessageReturn =
  | {
      ok: true
      ts: string
    }
  | {
      ok: false
    }

export class SlackClient {
  constructor(private readonly slackApiToken: string) {}

  async listChannels(): Promise<any> {
    const response = await axios.get("https://slack.com/api/conversations.list", {
      headers: {
        Authorization: `Bearer ${this.slackApiToken}`,
      },
    })
    return response.data
  }

  async sendMessage(channelId: string, msg: any, thread_ts?: string): Promise<MessageReturn> {
    const payload = {
      channel: channelId,
      text: msg.text || "",
      thread_ts: thread_ts,
      blocks: msg.blocks || [],
      attachments: msg.attachments || [],
    }

    try {
      const response = await axios.post("https://slack.com/api/chat.postMessage", payload, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${this.slackApiToken}`,
        },
      })

      const responseData = response.data

      if (!responseData.ok) {
        console.error("Slack API error:", responseData.error)
        return {
          ok: false,
        }
      }

      return {
        ok: true,
        ts: responseData.ts,
      }
    } catch (error) {
      console.error("Error sending message to Slack:", error)
      return {
        ok: false,
      }
    }
  }
}
