"use client"

import { JobListingWriteForm } from "../JobListingWriteForm"
import { useEditJobListingMutation } from "../mutations"
import { useJobListingDetailsContext } from "./provider"

export default function JobListingDetailsPage() {
  const { jobListing } = useJobListingDetailsContext()
  const edit = useEditJobListingMutation()

  return (
    <JobListingWriteForm
      onSubmit={({ locationIds, companyId, ...data }) => {
        edit.mutate({
          id: jobListing.id,
          input: data,
          locationIds,
          companyId,
        })
      }}
      defaultValues={{
        ...jobListing,
        locationIds: jobListing.locations.map((location) => location.name),
        companyId: jobListing.company.id,
      }}
      submitLabel="Oppdater stillingsannonse"
    />
  )
}
