import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

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
