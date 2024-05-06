"use client"
import { Loader } from "@mantine/core"
import { useMemo } from "react"
import { useCreateOfflineMutation } from "../modules/offline/mutations/use-create-offline-mutation"
import { trpc } from "../utils/trpc"
import { OfflineEditCard } from "./(dashboard)/offline/[id]/edit-card"
import { OfflineDetailsContext } from "./(dashboard)/offline/[id]/provider"
import { useOfflineWriteForm } from "./(dashboard)/offline/write-form"

export default function DashboardPage() {
  const { data, isLoading } = trpc.offline.all.useQuery()
  console.log(data)

  const value = useMemo(
    () =>
      data === undefined || isLoading
        ? null
        : {
            offline: data[0],
          },
    [data, isLoading]
  )

  const createOffline = useCreateOfflineMutation()

  const FormComponent = useOfflineWriteForm({
    onSubmit: async (data) => {
      console.log("onSubmit", data)
      createOffline.mutate({
        fileId: data.fileId,
        imageId: data.image.id,
        title: data.title,
        published: data.published,
      })
      console.log("Created offline")
    },
  })

  if (value === null) {
    return <Loader />
  }

  return (
    <OfflineDetailsContext.Provider value={value}>
      <OfflineEditCard />
      <FormComponent />
    </OfflineDetailsContext.Provider>
  )
}
