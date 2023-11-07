import { type FC } from "react"
import { useOfflineDetailsContext } from "./provider"
import { useEditOfflineMutation } from "../../../../modules/offline/mutations/use-edit-offline-mutation"
import { useS3UploadFile } from "../../../../modules/offline/use-s3-upload-file"
import { useOfflineWriteForm } from "../write-form"

export const OfflineEditCard: FC = () => {
  const { offline } = useOfflineDetailsContext()
  const edit = useEditOfflineMutation()
  const upload = useS3UploadFile()

  const FormComponent = useOfflineWriteForm({
    label: "Oppdater",
    onSubmit: async (data) => {
      if (data.file === undefined) {
        return
      }

      const fileToStore = await upload(data.file)

      edit.mutate({
        id: offline.id,
        input: {
          ...data,
          file: fileToStore,
        },
      })
    },
    defaultValues: {
      title: offline.title,
      published: offline.published,
      image: offline.image,
      id: offline.id,
    },
  })
  return <FormComponent />
}
