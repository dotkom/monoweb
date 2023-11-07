import { type FC } from "react"
import { useOfflineDetailsContext } from "./provider"
import { type OfflineWrite } from "../../../../../../../packages/types/src/offline"
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
      let file = null
      if (data.file !== undefined) {
        file = await upload(data.file)
      }

      let image = null
      if (data.image !== undefined) {
        image = await upload(data.image)
      }

      const toSave: Partial<OfflineWrite> = {
        title: data.title,
        published: data.published,
        id: data.id,
        file,
        image,
      }

      if (file === null) {
        delete toSave.file
      }

      if (image) {
        delete toSave.image
      }

      edit.mutate({
        id: offline.id,
        input: {
          ...toSave,
        },
      })
    },
    defaultValues: {
      title: offline.title,
      published: offline.published,
      imageUrl: offline.image,
      id: offline.id,
      fileUrl: offline.file,
    },
  })
  return <FormComponent />
}
