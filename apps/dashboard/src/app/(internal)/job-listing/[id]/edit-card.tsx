import type { FC } from "react"
import { useEditJobListingMutation } from "../mutations/use-edit-job-listing-mutation"
import { useJobListingWriteForm } from "../write-form"
import { useJobListingDetailsContext } from "./provider"

export const JobListingEditCard: FC = () => {
  const { jobListing } = useJobListingDetailsContext()
  const edit = useEditJobListingMutation()

  const FormComponent = useJobListingWriteForm({
    label: "Endre stillingsannonse",
    onSubmit: ({ locationIds, companyId, ...data }) => {
      edit.mutate({
        id: jobListing.id,
        input: data,
        locationIds,
        companyId,
      })
    },
    defaultValues: {
      applicationEmail: jobListing.applicationEmail,
      companyId: jobListing.company.id,
      description: jobListing.description,
      end: jobListing.end,
      about: jobListing.about,
      start: jobListing.start,
      title: jobListing.title,
      applicationLink: jobListing.applicationLink,
      deadline: jobListing.deadline,
      deadlineAsap: jobListing.deadlineAsap,
      employment: jobListing.employment,
      featured: jobListing.featured,
      locationIds: jobListing.locations.map((location) => location.name),
    },
  })
  return <FormComponent />
}
