"use server"

import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import { cookies } from "next/headers"

const isHttps = env.NEXT_PUBLIC_ORIGIN.startsWith("https://")
const cookiePrefix = isHttps ? "__Secure-" : ""

export async function getIdentityLinkCookies() {
  const cookieHandle = await cookies()

  const secondaryUserId = cookieHandle.get(`${cookiePrefix}monoweb-pending-link-user-id`)?.value
  const secondaryIdToken = cookieHandle.get(`${cookiePrefix}monoweb-pending-link-id-token`)?.value

  if (!secondaryUserId || !secondaryIdToken) {
    throw new Error("No pending identity link found. Please start the linking process again.")
  }

  return { secondaryUserId, secondaryIdToken }
}

export async function confirmIdentityLinkAction() {
  const cookieHandle = await cookies()

  const { secondaryUserId, secondaryIdToken } = await getIdentityLinkCookies()

  const mergedUser = await server.user.confirmIdentityLink.mutate({ secondaryIdToken, secondaryUserId })

  cookieHandle.delete(`${cookiePrefix}monoweb-pending-link-user-id`)
  cookieHandle.delete(`${cookiePrefix}monoweb-pending-link-id-token`)

  return mergedUser
}
