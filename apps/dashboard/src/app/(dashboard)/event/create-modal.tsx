import { Modal } from "@mantine/core"
import { FC } from "react"
import { trpc } from "../../../utils/trpc"
import { useEventWriteForm } from "./write-form"
import { useQueryNotification } from "../../notifications"
import { useRouter } from "next/navigation"

export type EventCreationModalProps = {
    close: () => void
}

export const EventCreationModal: FC<EventCreationModalProps> = ({ close }) => {
    const utils = trpc.useContext()
    const router = useRouter()
    const notification = useQueryNotification()
    const create = trpc.event.create.useMutation({
        onSuccess: (data) => {
            notification.complete({
                title: "Arrangement opprettet",
                message: `Arrangementet "${data.title}" har blitt opprettet.`,
            })
            utils.event.all.invalidate()
            router.push(`/event/${data.id}`)
        },
        onError: (err) => {
            notification.fail({
                title: "Feil oppsto",
                message: `En feil oppsto under opprettelse av arrangementet: ${err.toString()}.`,
            })
        },
    })
    const FormComponent = useEventWriteForm({
        onSubmit: (data) => {
            notification.loading({
                title: "Oppretter arrangement...",
                message: "Arrangementet blir opprettet, og du vil bli videresendt til arrangementsiden.",
            })
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