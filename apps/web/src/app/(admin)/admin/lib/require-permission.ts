import { redirect } from "next/navigation"
import {
  canAccessAuditLog,
  canAccessInterestGroupEvents,
  canEditFadderuke,
  canEditOffline,
} from "@admin/auth/permissions"
import { getServerAuthorizationState } from "@admin/lib/server-authorization"

export const UNAUTHORIZED_PATH = "/admin/ikke-tilgang"

export async function requireAuditLogAccess() {
  const state = await getServerAuthorizationState()

  if (!canAccessAuditLog(state)) {
    redirect(UNAUTHORIZED_PATH)
  }
}

export async function requireOfflineEditAccess() {
  const state = await getServerAuthorizationState()

  if (!canEditOffline(state)) {
    redirect(UNAUTHORIZED_PATH)
  }
}

export async function requireInterestGroupEventAccess() {
  const state = await getServerAuthorizationState()

  if (!canAccessInterestGroupEvents(state)) {
    redirect(UNAUTHORIZED_PATH)
  }
}

export async function requireFadderukeEditAccess() {
  const state = await getServerAuthorizationState()

  if (!canEditFadderuke(state)) {
    redirect(UNAUTHORIZED_PATH)
  }
}
