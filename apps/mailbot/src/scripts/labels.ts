import { SlackClient } from "../core/SlackClient"
import { env } from "../env"

const slackClient = new SlackClient(env.SLACK_API_TOKEN)
const channels = await slackClient.listChannels()
console.log(
  JSON.stringify(
    channels.channels.map((c: any) => ({ name: c.name, id: c.id })),
    null,
    2
  )
)

console.log("Save ID of channel to doppler project")
