import { useRouter } from "next/navigation"
import { trpc } from "../../../../utils/trpc"
import { useQueryNotification } from "../../../notifications"

export const useCreateWebshopProductMutation = () => {
  const utils = trpc.useContext()
  const router = useRouter()
  const notification = useQueryNotification()
  return trpc.webshopProduct.createBaseProduct.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppretter...",
        message: "Opprettet. Du vil bli videresendt til stillingsannonsen.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Opprettet",
        message: `${data.name}" har blitt opprettet.`,
      })
      utils.webshopProduct.all.invalidate()
      router.push(`/webshop-product/${data.id}`)
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under opprettelse: ${err.toString()}.`,
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
