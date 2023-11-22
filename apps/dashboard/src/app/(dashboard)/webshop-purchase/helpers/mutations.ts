import { useRouter } from "next/router"
import { trpc } from "../../../../utils/trpc"
import { useQueryNotification } from "../../../notifications"

export const useCreateJobListingMutation = () => {
  const utils = trpc.useContext()
  const router = useRouter()
  const notification = useQueryNotification()
  return trpc.jobListing.create.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppretter stillingsannonse...",
        message: "Stillingsannonsen blir opprettet, og du vil bli videresendt til stillingsannonsen.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Stillingsannonse opprettet",
        message: `Stillingsannonse "${data.title}" har blitt opprettet.`,
      })
      utils.jobListing.all.invalidate()
      router.push(`/job-listing/${data.id}`)
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under opprettelse av stillingsannonsen: ${err.toString()}.`,
      })
    },
  })
}

export const useEditWebshopPurchaseMutation = () => {
  const notification = useQueryNotification()
  const utils = trpc.useContext()
  return trpc.webshopPurchase.edit.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer...",
        message: "",
      })
    },
    onSuccess: () => {
      notification.complete({
        title: "Oppdatert",
        message: "",
      })
      utils.webshopPurchase.all.invalidate()
    },
    onError: () => {
      notification.fail({
        title: "Feil",
        message: "",
      })
    },
  })
}
