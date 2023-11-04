import { type FC } from "react"
import { useOfflineDetailsContext } from "./provider"
import { useOfflineWriteForm } from "../write-form"
import { useEditOfflineMutation } from "../../../../modules/offline/mutations/use-edit-offline-mutation"
import { trpc } from "../../../../utils/trpc"

export const OfflineEditCard: FC = () => {
  const { offline } = useOfflineDetailsContext()
  const edit = useEditOfflineMutation()

  const url = trpc.offline.getS3UploadLink
  // {
  //   filename: "henrik.pdf",
  //   mimeType: "application/pdf",
  // },

  // const query = trpc.useQuery(["company.find", { id }], {
  //   enabled: Boolean(id),
  //   onSuccess(data) {
  //     // call function to display modal with content from query
  //     displayModal({ content: data })
  //   },
  // })

  // const showModal = async (id: string) => {
  //   setId(id)
  // }

  console.log(url)

  const FormComponent = useOfflineWriteForm({
    label: "Oppdater",
    onSubmit: (data) => {
      // uploadFileBrowser("skog-testing", data.file)
      url.mutate({
        filename: data.file.name,
        mimeType: data.file.type,
      })

      const test = await trpc.offline.getS3UploadLink.useQuery({
        filename: data.file.name,
        mimeType: data.file.type,
      })

      edit.mutate({
        id: offline.id,
        input: data,
      })
    },
    defaultValues: offline,
  })
  return <FormComponent />
}
