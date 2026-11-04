"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { canCreateGroups } from "@dotkomonline/rpc/group-permissions"
import { GroupWriteForm } from "../components/GroupWriteForm"
import { useCreateGroupMutation } from "../mutations"
import { ReadOnlyNotice } from "../../components/ReadOnlyNotice"

export default function CreateGroupPage() {
  const create = useCreateGroupMutation()
  const authorization = useAuthorization()
  const canCreate = canCreateGroups(authorization)

  return (
    <div className="flex flex-col gap-4">
      {!canCreate && (
        <ReadOnlyNotice
          title="Du kan ikke opprette grupper."
          message="Kontakt dotkom dersom du mener dette er en feil."
        />
      )}
      <GroupWriteForm onSubmit={create.mutate} submitLabel="Opprett gruppe" disabled={!canCreate} />
    </div>
  )
}
