import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useCreateArticleMutation } from "../mutations"
import { useArticleWriteForm } from "../write-form"

export const CreateArticleModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateArticleMutation()
  const FormComponent = useArticleWriteForm({
    onSubmit: (data) => {
      const { tags, ...article } = data
      create.mutate({
        article,
        tags: tags.map((tag) => tag.name),
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateArticleModal = () => () =>
  modals.openContextModal({
    modal: "article/create",
    title: "Legg inn ny artikkel",
    size: "lg",
    innerProps: {},
  })
