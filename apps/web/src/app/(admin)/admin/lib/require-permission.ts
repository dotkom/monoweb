import { redirect } from "next/navigation"
import { canAccessAuditLog, canAccessSidequests, canEditFadderuke, canEditOffline } from "@admin/auth/permissions"
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

export async function requireSidequestAccess() {
  const state = await getServerAuthorizationState()

  if (!canAccessSidequests(state)) {
    redirect(UNAUTHORIZED_PATH)
  }
}

export async function requireFadderukeEditAccess() {
  const state = await getServerAuthorizationState()

  if (!canEditFadderuke(state)) {
    redirect(UNAUTHORIZED_PATH)
  }
}
