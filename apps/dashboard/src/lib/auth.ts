import type { User } from "@auth0/nextjs-auth0/types"

import { auth0 } from "./auth0"

export type AppSession = User & {
  accessToken: string
  refreshToken?: string
}

export async function getServerSession(): Promise<AppSession | null> {
  const session = await auth0.getSession()

  if (session === null) {
    return null
  }

  try {
    const { token } = await auth0.getAccessToken()

    return {
      ...session.user,
      accessToken: token,
      refreshToken: session.tokenSet?.refreshToken,
    }
  } catch {
    return null
  }
}

export { auth0 }
