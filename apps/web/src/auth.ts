import type { User } from "@auth0/nextjs-auth0/types"

import { getServerAccessToken } from "@/lib/server-access-token"
import { auth0 } from "@/lib/auth0"

export type AppSession = User & {
  accessToken: string
  refreshToken?: string
}

export async function getServerSession(): Promise<AppSession | null> {
  const session = await auth0.getSession()

  if (session === null) {
    return null
  }

  const accessToken = await getServerAccessToken()

  if (accessToken === null) {
    return null
  }

  return {
    ...session.user,
    accessToken,
    refreshToken: session.tokenSet?.refreshToken,
  }
}

export { auth0 }
