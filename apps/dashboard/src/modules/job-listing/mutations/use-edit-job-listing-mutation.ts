import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useEditJobListingMutation = () => {
  const notification = useQueryNotification()
  const utils = trpc.useContext()
  return trpc.jobListing.edit.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppdaterer stillingsannonse...",
        message: "Stillingsannonsen blir oppdatert.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Stillingsannonse oppdatert",
        message: `Stillingsannonsen "${data.title}" har blitt oppdatert.`,
      })
      utils.jobListing.all.invalidate()
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av stillingsannonsen: ${err.toString()}.`,
      })
    },
  })
}
