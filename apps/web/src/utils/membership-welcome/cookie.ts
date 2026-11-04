"use server"

import { cookies } from "next/headers"

export async function removeWelcomeCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("should_welcome")
}

export async function hasWelcomeCookie() {
  const cookieStore = await cookies()
  return cookieStore.has("should_welcome")
}
