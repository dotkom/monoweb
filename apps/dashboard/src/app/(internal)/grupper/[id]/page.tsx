"use client"

import { useGroupPermissions } from "@/app/(internal)/grupper/use-group-permissions"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { GroupWorkspaceLinkCard } from "../components/GroupWorkspaceLinkCard"
import { GroupWriteForm } from "../components/GroupWriteForm"
import { useUpdateGroupMutation } from "../mutations"
import { useGroupDetailsContext } from "./provider"

export default function GroupInfoPage() {
  const { group } = useGroupDetailsContext()
  const edit = useUpdateGroupMutation()
  const { canUpdate, canEdit } = useGroupPermissions()

  return (
    <div className="flex flex-col gap-4">
      {!canUpdate && canEdit && (
        <ReadOnlyNotice
          title="Du kan ikke redigere gruppen"
          message="Dette er fordi du ikke er et medlem av gruppen. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}

      <GroupWorkspaceLinkCard group={group} />
      <GroupWriteForm
        submitLabel="Oppdater gruppe"
        disabled={!canUpdate}
        onSubmit={(data) => {
          edit.mutate({
            id: group.slug,
            values: data,
          })
        }}
        defaultValues={group}
      />
    </div>
  )
}
