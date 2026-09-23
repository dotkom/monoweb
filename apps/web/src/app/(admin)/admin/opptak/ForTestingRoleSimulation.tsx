"use client"

import type { CommitteeGroupSlug } from "@dotkomonline/rpc/permissions"
import type { GroupRoleType } from "@dotkomonline/rpc/group"
import { Button } from "@dotkomonline/ui"
import { useEffect, useState } from "react"

interface SimulatedAuthorization {
  isAdministrator: boolean
  isCommitteeMember: boolean
  affiliations: Record<string, GroupRoleType[]>
}

const STORAGE_KEY = "fortesting-role"

// Which committee Leder, Nestleder and Komitemedlem belong to. Avoid "dotkom" and "hs", they count as administrators.
const SIMULATED_COMMITTEE: CommitteeGroupSlug = "backlog"

const asCommitteeRole = (role: GroupRoleType): SimulatedAuthorization => ({
  isAdministrator: false,
  isCommitteeMember: true,
  affiliations: { [SIMULATED_COMMITTEE]: [role] },
})

const SIMULATED_ROLES = {
  Admin: { isAdministrator: true, isCommitteeMember: true, affiliations: { dotkom: ["COSMETIC"] } },
  Leder: asCommitteeRole("LEADER"),
  Nestleder: asCommitteeRole("DEPUTY_LEADER"),
  Komitemedlem: asCommitteeRole("COSMETIC"),
} satisfies Record<string, SimulatedAuthorization>

type SimulatedRole = keyof typeof SIMULATED_ROLES

const useStoredRole = () => {
  const [role, setRole] = useState<SimulatedRole | null>(null)

  useEffect(() => setRole(localStorage.getItem(STORAGE_KEY) as SimulatedRole | null), [])

  return role
}

export const useSimulatedAuthorization = () => {
  const role = useStoredRole()

  return role === null ? null : (SIMULATED_ROLES[role] ?? null)
}

export function ForTestingRoleSimulation() {
  const role = useStoredRole()

  const select = (next: SimulatedRole) => {
    if (next === role) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, next)
    }

    location.reload()
  }

  return (Object.keys(SIMULATED_ROLES) as SimulatedRole[]).map((name) => (
    <Button key={name} variant={name === role ? "default" : "outline"} onClick={() => select(name)}>
      {name}
    </Button>
  ))
}

// To remove the role simulation: delete this file, remove <ForTestingRoleSimulation /> from
// opptak/page.tsx, and revert the two changes below in authorization-context.tsx.
//
// Remove this import:
// import { useSimulatedAuthorization } from "@admin/opptak/ForTestingRoleSimulation"
//
// Change the provider back to:
// export function AuthorizationProvider({
//   children,
//   isAdministrator,
//   isCommitteeMember,
//   affiliations,
// }: PropsWithChildren<SimulatedAuthorization>) {
//   const value = useMemo<AuthorizationState>(
