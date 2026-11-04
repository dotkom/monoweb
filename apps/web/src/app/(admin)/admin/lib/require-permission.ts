import { getServerAuthorizationState } from "@admin/lib/server-authorization"
import { canAccessAuditLog } from "@dotkomonline/rpc/audit-log-permissions"
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

export async function requireFadderukeEditAccess() {
  const state = await getServerAuthorizationState()

  if (!canManageFadderuker(state)) {
    redirect(UNAUTHORIZED_PATH)
  }
}
