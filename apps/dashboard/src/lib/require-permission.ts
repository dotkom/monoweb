import { redirect } from "next/navigation"
import { canAccessAuditLog, canEditFadderuke, canEditOffline } from "@/auth/permissions"
import { getServerAuthorizationState } from "@/lib/server-authorization"

export const UNAUTHORIZED_PATH = "/ikke-tilgang"

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

export async function requireFadderukeEditAccess() {
  const state = await getServerAuthorizationState()

  if (!canEditFadderuke(state)) {
    redirect(UNAUTHORIZED_PATH)
  }
}
