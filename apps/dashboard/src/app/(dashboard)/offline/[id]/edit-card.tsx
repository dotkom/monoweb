import axios from "axios"
import { type FC } from "react"
import { useOfflineDetailsContext } from "./provider"
import { useEditOfflineMutation } from "../../../../modules/offline/mutations/use-edit-offline-mutation"
import { trpc } from "../../../../utils/trpc"
import { useOfflineWriteForm } from "../write-form"

export async function uploadFile(file: File, fields: Record<string, string>, url: string) {
  try {
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value)
    })

    // Append the file to the formData
    formData.append("file", file)

    await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  } catch (e) {
    throw new Error(`file (upload failed: ${e}`)
  }
}

export const OfflineEditCard: FC = () => {
  const { offline } = useOfflineDetailsContext()
  const edit = useEditOfflineMutation()
  const url = trpc.offline.getS3UploadLink.useMutation()

  const FormComponent = useOfflineWriteForm({
    label: "Oppdater",
    onSubmit: async (data) => {
      let fileToStore = ""
      if (data.file !== undefined) {
        const stuffNeededToUpload = await url.mutateAsync({
          filename: `offlines/${data.file.name}`,
          mimeType: data.file.type,
        })
        console.log(stuffNeededToUpload)

        await uploadFile(data.file, stuffNeededToUpload.fields, stuffNeededToUpload.url)

        fileToStore = stuffNeededToUpload.fields.key
      }

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
