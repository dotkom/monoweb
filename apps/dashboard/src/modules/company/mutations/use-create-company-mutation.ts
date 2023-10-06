import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"
import { useRouter } from "next/navigation"

export const useCreateCompanyMutation = () => {
  const utils = trpc.useContext()
  const router = useRouter()
  const notification = useQueryNotification()
  return trpc.company.create.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Registrerer bedrift...",
        message: "Bedriften registreres, og du vil bli videresendt til detaljsiden.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Bedrift registrert",
        message: `Bedrift "${data.name}" har blitt registrert.`,
      })
      utils.company.all.invalidate()
      router.push(`/company/${data.id}`)
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under registrering av bedriften: ${err.toString()}.`,
      })
    },
  })
}
