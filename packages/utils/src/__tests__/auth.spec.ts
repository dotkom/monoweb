import { expect, it } from "vitest"
import { getAuthSessionCookieNamesToClear } from "../auth"

const SESSION_COOKIE_NAME = "onlineweb_session_web"

it("finds Auth0 session cookies", () => {
  const cookieNames = [SESSION_COOKIE_NAME, `${SESSION_COOKIE_NAME}__0`, `${SESSION_COOKIE_NAME}__1`]

  expect(getAuthSessionCookieNamesToClear(cookieNames, SESSION_COOKIE_NAME)).toEqual(cookieNames)
})

it("finds Auth0 connection and transaction cookies", () => {
  const cookieNames = ["__FC_0", "__txn_login", "__txn_link-account"]

  expect(getAuthSessionCookieNamesToClear(cookieNames, SESSION_COOKIE_NAME)).toEqual(cookieNames)
})

it("leaves unrelated cookies alone", () => {
  const cookieNames = ["theme", "session", "onlineweb_session_dashboard", "monoweb-link-state"]

  expect(getAuthSessionCookieNamesToClear(cookieNames, SESSION_COOKIE_NAME)).toEqual([])
})
