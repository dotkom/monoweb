import { Modal } from "@mantine/core"
import { FC } from "react"

import { EventWriteSchema } from "@dotkomonline/types"
import { trpc } from "../../trpc"
import { createCheckboxInput, createDateTimeInput, createSelectInput, createTextInput, useFormBuilder } from "../form"

export type EventCreationModalProps = {
  close: () => void
}

export const EventCreationModal: FC<EventCreationModalProps> = ({ close }) => {
  const { data: committees = [] } = trpc.committee.all.useQuery({ limit: 50 })
  const utils = trpc.useContext()
  const create = trpc.event.create.useMutation({
    onSuccess: () => {
      utils.event.all.invalidate()
    },
  })
  const FormComponent = useFormBuilder({
    schema: EventWriteSchema,
    label: "Opprett arrangement",
    defaultValues: {
      committeeId: null,
      start: new Date(),
      end: new Date(),
      description: null,
      subtitle: null,
      imageUrl: null,
      location: null,
    },
    fields: {
      title: createTextInput({
        label: "Arrangementnavn",
        placeholder: "Åre 2024",
        withAsterisk: true,
      }),
      start: createDateTimeInput({
        label: "Starttidspunkt",
        withAsterisk: true,
      }),
      end: createDateTimeInput({
        label: "Sluttidspunkt",
        withAsterisk: true,
      }),
      committeeId: createSelectInput({
        label: "Arrangør",
        placeholder: "Arrkom",
        data: committees.map((committee) => ({ value: committee.id, label: committee.name })),
      }),
      status: createSelectInput({
        label: "Event status",
        placeholder: "Velg en",
        data: [
          { value: "TBA", label: "TBA" },
          { value: "PUBLIC", label: "Public" },
          { value: "NO_LIMIT", label: "No Limit" },
          { value: "ATTENDANCE", label: "Attendance" },
        ],
        withAsterisk: true,
      }),
      type: createSelectInput({
        label: "Type",
        placeholder: "Velg en",
        data: [
          { value: "SOCIAL", label: "Sosialt" },
          { value: "COMPANY", label: "Bedriftsarrangement" },
        ],
      }),
      public: createCheckboxInput({
        label: "Offentlig arrangement",
      }),
    },
    onSubmit: (data) => {
      create.mutate(data)
      close()
    },
  })
  return (
    <Modal centered title="Opprett nytt arrangement" opened onClose={close}>
      {FormComponent}
    </Modal>
  )
}
