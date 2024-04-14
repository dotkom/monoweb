import type { FC } from "react"
import { useEditJobListingMutation } from "../../../../modules/job-listing/mutations/use-edit-job-listing-mutation"
import { useJobListingWriteForm } from "../write-form"
import { useJobListingDetailsContext } from "./provider"

export const JobListingEditCard: FC = () => {
  const { jobListing } = useJobListingDetailsContext()
  const edit = useEditJobListingMutation()

  const defaultValues = {
    ...jobListing,
    companyId: jobListing.company.id,
    company: undefined
  }

  const FormComponent = useJobListingWriteForm({
    label: "Endre stillingsannonse",
    onSubmit: (data) => {
      console.log(data)
      edit.mutate({
        id: jobListing.id,
        input: data,
      })
    },
    defaultValues,
  })
  return <FormComponent />
}
