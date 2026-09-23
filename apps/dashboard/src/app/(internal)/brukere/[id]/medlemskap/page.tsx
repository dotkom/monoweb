"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { Button, Text, Title } from "@dotkomonline/ui"
import { compareDesc } from "date-fns"
import { useMemo, useState } from "react"
import { useUserDetailsContext } from "../provider"
import { CreateMembershipModal } from "./components/CreateMembershipModal"
import { MembershipTable } from "./components/MembershipTable"

export default function UserMedlemskapPage() {
  const { user } = useUserDetailsContext()
  const { canManageUserMemberships } = useAuthorization()
  const canManage = canManageUserMemberships()
  const [createOpen, setCreateOpen] = useState(false)

  const memberships = useMemo(
    () => user.memberships.toSorted((a, b) => compareDesc(a.start, b.start)),
    [user.memberships]
  )

  return (
    <div className="flex flex-col gap-4">
      <Title element="h2" className="text-2xl font-semibold">
        Medlemskap
      </Title>
      <Text className="text-sm text-muted-foreground">
        Bruk <strong>Opprett medlemskap</strong> for ny informasjon. Bruk <strong>Oppdater</strong> kun for å rette opp
        i eksisterende informasjon.
      </Text>

      <MembershipTable
        data={memberships}
        actions={
          <PermissionTooltip allowed={canManage}>
            <Button type="button" variant="default" disabled={!canManage} onClick={() => setCreateOpen(true)}>
              Opprett medlemskap
            </Button>
          </PermissionTooltip>
        }
      />

      <CreateMembershipModal open={createOpen} onOpenChange={setCreateOpen} userId={user.id} />
    </div>
  )
}
