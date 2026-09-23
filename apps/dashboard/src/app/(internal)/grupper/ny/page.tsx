"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { GroupWriteForm } from "../components/GroupWriteForm"
import { useCreateGroupMutation } from "../mutations"

export default function CreateGroupPage() {
  const create = useCreateGroupMutation()
  const { canCreateGroup } = useAuthorization()
  const canCreate = canCreateGroup("COMMITTEE") || canCreateGroup("INTEREST_GROUP")

  return <GroupWriteForm onSubmit={create.mutate} submitLabel="Opprett gruppe" disabled={!canCreate} />
}
