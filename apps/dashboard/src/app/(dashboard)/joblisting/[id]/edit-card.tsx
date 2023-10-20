import { FC } from "react"
import { useJobListingWriteForm } from "../write-form"
import { useJobListingDetailsContext } from "./provider"
import { useEditJobListingMutation } from "src/modules/joblisting/mutations/use-edit-joblisting-mutation"

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
