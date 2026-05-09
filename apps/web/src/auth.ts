import type { User } from "@auth0/nextjs-auth0/types"

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

  const accessToken = session.tokenSet?.accessToken

  if (accessToken === undefined || accessToken === "") {
    return null
  }

  return {
    ...session.user,
    accessToken,
    refreshToken: session.tokenSet.refreshToken,
  }
}

export { auth0 }
