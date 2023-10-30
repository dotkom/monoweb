import { FC } from "react"
import { useJobListingWriteForm } from "src/app/(dashboard)/job-listing/write-form"
import { useCreateJobListingMutation } from "../mutations/use-create-job-listing-mutation"
import { ContextModalProps, modals } from "@mantine/modals"

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

export const useCreateJobListingModal = () => {
  return () =>
    modals.openContextModal({
      modal: "jobListing/create",
      title: "Opprett ny stillingsannonse",
      innerProps: {},
    })
}
