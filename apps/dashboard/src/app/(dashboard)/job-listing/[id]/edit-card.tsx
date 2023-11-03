import { type FC } from "react"
import { useJobListingDetailsContext } from "./provider"
import { useJobListingWriteForm } from "../write-form"
import { useEditJobListingMutation } from "../../../../modules/job-listing/mutations/use-edit-job-listing-mutation"

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
