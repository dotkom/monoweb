import { canAccessAuditLog, canAccessSidequests } from "@admin/auth/permissions"
import { getServerAuthorizationState } from "@admin/lib/server-authorization"
import { canManageFadderuker } from "@dotkomonline/rpc/fadderuke-permissions"
import { canManageOfflines } from "@dotkomonline/rpc/offline-permissions"
import { redirect } from "next/navigation"

export const UNAUTHORIZED_PATH = "/admin/ikke-tilgang"

export async function requireAuditLogAccess() {
  const state = await getServerAuthorizationState()

  if (!canAccessAuditLog(state)) {
    redirect(UNAUTHORIZED_PATH)
  }
}

export async function requireOfflineEditAccess() {
  const state = await getServerAuthorizationState()

  if (!canManageOfflines(state)) {
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

  if (!canManageFadderuker(state)) {
    redirect(UNAUTHORIZED_PATH)
  }
}
