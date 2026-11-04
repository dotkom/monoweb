"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ReadOnlyNotice } from "@admin/components/ReadOnlyNotice"
import { canManageJobListings } from "@dotkomonline/rpc/job-listing-permissions"
import { JobListingWriteForm } from "../JobListingWriteForm"
import { useCreateJobListingMutation } from "../mutations"

export default function Page() {
  const create = useCreateJobListingMutation()
  const authorization = useAuthorization()
  const canEdit = canManageJobListings(authorization)

  return (
    <div className="flex flex-col gap-4">
      {!canEdit && (
        <ReadOnlyNotice
          title="Du kan ikke opprette stillingsannonser."
          message="Kontakt dotkom dersom du mener dette er en feil."
        />
      )}
      <JobListingWriteForm
        disabled={!canEdit}
        onSubmit={({ locationIds, companyId, ...data }) => {
          create.mutate({
            input: data,
            locationIds,
            companyId,
          })
        }}
        submitLabel="Opprett stillingsannonse"
      />
    </div>
  )
}
