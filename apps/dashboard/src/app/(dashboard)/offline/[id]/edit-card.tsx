import type { OfflineWrite } from "@dotkomonline/types"
import type { FC } from "react"
import type { File } from "../../../../../stubs/file/File"
import { useEditOfflineMutation } from "../../../../modules/offline/mutations/use-edit-offline-mutation"
import { useS3UploadFile } from "../../../../modules/offline/use-s3-upload-file"
import { useOfflineWriteForm } from "../write-form"
import { useOfflineDetailsContext } from "./provider"

export const OfflineEditCard: FC = () => {
  const { offline } = useOfflineDetailsContext()
  console.log(offline)
  const edit = useEditOfflineMutation()
  const upload = useS3UploadFile()

  const handleUpload = async (file?: File) => (file?.name ? await upload(file) : null)

  const FormComponent = useOfflineWriteForm({
    label: "Oppdater",
    onSubmit: async (data) => {
      // Only upload if files are present
      const fileUrl = await handleUpload(data.file)
      const imageUrl = await handleUpload(data.image)

      const toSave: Partial<OfflineWrite> = {
        ...data,
        fileUrl: fileUrl ?? data.fileUrl, // Preserving existing URL if no new file uploaded
        imageUrl: imageUrl ?? data.imageUrl, // Preserving existing URL if no new image uploaded
      }

      edit.mutate({
        id: offline.id,
        input: {
          ...toSave,
        },
      })
    },
    defaultValues: offline,
  })
  return <FormComponent />
}
