import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useArticleWriteForm } from "../../../app/(dashboard)/article/write-form"
import { useCreateArticleMutation } from "../mutations/use-create-article-mutation"

export const CreateArticleModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateArticleMutation()
  const FormComponent = useArticleWriteForm({
    onSubmit: (data) => {
      const { tags, ...article } = data
      create.mutate({
        article,
        tags,
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
