import { type FC } from "react"
import { type ContextModalProps, modals } from "@mantine/modals"
import { useCreateJobListingMutation } from "../mutations/use-create-job-listing-mutation"
import { useJobListingWriteForm } from "../../../app/(dashboard)/job-listing/write-form"

export const CreateJobListingModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateJobListingMutation()
  const FormComponent = useJobListingWriteForm({
    onSubmit: (data) => {
      create.mutate(data)
      close()
    },
  })
  return <FormComponent />
}

export const useCreateJobListingModal = () => () =>
  modals.openContextModal({
    modal: "jobListing/create",
    title: "Opprett ny stillingsannonse",
    innerProps: {},
  })
