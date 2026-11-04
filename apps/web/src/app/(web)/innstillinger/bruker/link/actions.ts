"use server"

import {
  getIdentityLinkStatusCookieOptions,
  getLinkIdentityCookieNames,
  IDENTITY_LINK_STATUS_COOKIE,
  IDENTITY_LINK_STATUS_VALUE,
} from "@/lib/link-identity-cookies"
import { clearHasDuplicateUserFromSession } from "@/lib/auth0"
import { server } from "@/utils/trpc/server"
import { cookies } from "next/headers"

export async function getIdentityLinkCookies() {
  const cookieHandle = await cookies()
  const cookieNames = getLinkIdentityCookieNames()

  // `secondaryUserId` is read from a display-only cookie populated by the link-identity callback. It is NOT proof of
  // ownership and must never be passed to RPC as the identity to link — RPC derives the real secondary user ID from
  // the verified ID token's `sub`. Use this only to render confirmation UI.
  const secondaryUserId = cookieHandle.get(cookieNames.pendingUserId)?.value
  const secondaryIdToken = cookieHandle.get(cookieNames.pendingIdToken)?.value

  if (!secondaryUserId || !secondaryIdToken) {
    throw new Error("No pending identity link found. Please start the linking process again.")
  }

  return { secondaryUserId, secondaryIdToken }
}

export async function confirmIdentityLinkAction() {
  const cookieHandle = await cookies()
  const cookieNames = getLinkIdentityCookieNames()

  const { secondaryIdToken } = await getIdentityLinkCookies()

  const result = await server.user.confirmIdentityLink.mutate({ secondaryIdToken })

  cookieHandle.delete(cookieNames.pendingUserId)
  cookieHandle.delete(cookieNames.pendingIdToken)

  if (result.requiresReauthentication) {
    cookieHandle.set(IDENTITY_LINK_STATUS_COOKIE, IDENTITY_LINK_STATUS_VALUE, getIdentityLinkStatusCookieOptions())
  }

  try {
    await clearHasDuplicateUserFromSession()
  } catch (error) {
    console.error("[web:link-identity] failed to clear duplicate user notice", error)
  }

  return result
}

export async function clearIdentityLinkStatusAction() {
  const cookieHandle = await cookies()

  cookieHandle.delete(IDENTITY_LINK_STATUS_COOKIE)
}
