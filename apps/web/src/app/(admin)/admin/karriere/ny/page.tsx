"use client"

import { JobListingWriteForm } from "../JobListingWriteForm"
import { useCreateJobListingMutation } from "../mutations"

export default function Page() {
  const create = useCreateJobListingMutation()

  return (
    <JobListingWriteForm
      onSubmit={({ locationIds, companyId, ...data }) => {
        create.mutate({
          input: data,
          locationIds,
          companyId,
        })
      }}
      submitLabel="Opprett stillingsannonse"
    />
  )
}
