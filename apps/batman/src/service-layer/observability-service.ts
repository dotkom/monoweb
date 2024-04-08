import { env } from "./env"

interface ObservabilityService {
  notify(message: string): void
}

export const notifyOfEvent = async (messages: string[]) => {}

export class ObservabilityServiceImpl implements ObservabilityService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {
    console.log("ObservabilityServiceImpl initialized")
  }
  notify(message: string): void {
    this.notificationsRepository.sendMessage(message)
  }
}

interface NotificationsRepository {
  sendMessage(message: string): Promise<void>
}

export class DiscordRepository implements NotificationsRepository {
  // Notifies me :)
  async sendMessage(message: string) {
    await fetch(env.ENV_NOTIFY_URL_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        to: env.ENV_NOTIFIER_DESTINATION,
        messages: [message],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
