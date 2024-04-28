import type { FC } from "react"
import { useEditJobListingMutation } from "../../../../modules/job-listing/mutations/use-edit-job-listing-mutation"
import { useJobListingWriteForm } from "../write-form"
import { useJobListingDetailsContext } from "./provider"

export const JobListingEditCard: FC = () => {
  const { jobListing } = useJobListingDetailsContext()
  const edit = useEditJobListingMutation()

  const FormComponent = useJobListingWriteForm({
    label: "Oppdater stillingsannonse",
    onSubmit: (data) => {
      edit.mutate({
        id: jobListing.id,
        input: data,
      })
    },
    defaultValues: jobListing,
  })
  return <FormComponent />
}
