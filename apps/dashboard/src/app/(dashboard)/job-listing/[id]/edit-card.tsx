import type { FC } from "react"
import { useEditJobListingMutation } from "../../../../modules/job-listing/mutations/use-edit-job-listing-mutation"
import { useJobListingWriteForm } from "../write-form"
import { useJobListingDetailsContext } from "./provider"

export const JobListingEditCard: FC = () => {
  const { jobListing } = useJobListingDetailsContext()
  const edit = useEditJobListingMutation()

  const FormComponent = useJobListingWriteForm({
    label: "Endre stillingsannonse",
    onSubmit: (data) => {
      edit.mutate({
        id: jobListing.id,
        input: data,
      })
    },
    defaultValues: {
      applicationEmail: jobListing.applicationEmail,
      companyId: jobListing.company.id,
      description: jobListing.description,
      end: jobListing.end,
      ingress: jobListing.ingress,
      start: jobListing.start,
      title: jobListing.title,
      applicationLink: jobListing.applicationLink,
      deadline: jobListing.deadline,
      deadlineAsap: jobListing.deadlineAsap,
      employment: jobListing.employment,
      featured: jobListing.featured,
      locations: jobListing.locations,
    },
  })
  return <FormComponent />
}
