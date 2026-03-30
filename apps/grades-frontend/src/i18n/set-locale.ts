"use server"

import { cookies } from "next/headers"
import type { Locale } from "./locale"

export async function setLocale(locale: Locale) {
  const store = await cookies()
  store.set("locale", locale, { path: "/" })
}
