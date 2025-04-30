import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useCreateArticleMutation } from "../mutations/create-article"
import { useArticleWriteForm } from "../write-form"

export const CreateArticleModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateArticleMutation()
  const FormComponent = useArticleWriteForm({
    onSubmit: (data) => {
      create.mutate(data)
      close()
    },
  })
  return <FormComponent />
}

export const useCreateArticleModal = () => () =>
  modals.openContextModal({
    modal: "article/create",
    title: "Legg inn ny artikkel",
    innerProps: {},
  })
