import { modals, type ContextModalProps } from "@mantine/modals"
import { type FC } from "react"
import { useCreateWebshopProductMutation } from "./mutations"
import { useWebshopProductWriteForm } from "../write-form"

export const CreateWebshopProductModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateWebshopProductMutation()
  const FormComponent = useWebshopProductWriteForm({
    onSubmit: (data) => {
      const images = data.images.split(",")
      create.mutate({
        name: data.name,
        price: data.price,
        description: data.variantDescription,
        images,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateWebshopProductModal = () => () =>
  modals.openContextModal({
    modal: "webshopProduct/create",
    title: "Opprett nytt arrangement",
    innerProps: {},
  })
