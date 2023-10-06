import { Modal } from "@mantine/core"
import { FC } from "react"
import { trpc } from "../../../utils/trpc"
import { useQueryNotification } from "../../notifications"
import { useRouter } from "next/navigation"
import { useCompanyWriteForm } from "./write-form"

export type CompanyCreationModalProps = {
  close: () => void
}

export const CompanyCreationModal: FC<CompanyCreationModalProps> = ({ close }) => {
  const utils = trpc.useContext()
  const router = useRouter()
  const notification = useQueryNotification()
  const create = trpc.company.create.useMutation({
    onSuccess: (data) => {
      notification.complete({
        title: "Arrangement opprettet",
        message: `Arrangementet "${data.name}" har blitt opprettet.`,
      })
      utils.company.all.invalidate()
      router.push(`/company/${data.id}`)
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under opprettelse av arrangementet: ${err.toString()}.`,
      })
      console.log(err)
    },
  })
  const FormComponent = useCompanyWriteForm({
    onSubmit: (data) => {
      notification.loading({
        title: "Oppretter arrangement...",
        message: "Arrangementet blir opprettet, og du vil bli videresendt til arrangementsiden.",
      })
      console.log(data)
      create.mutate(data)
      close()
    },
  })
  return (
    <Modal centered title="Opprett nytt arrangement" opened onClose={close}>
      <FormComponent />
    </Modal>
  )
}
