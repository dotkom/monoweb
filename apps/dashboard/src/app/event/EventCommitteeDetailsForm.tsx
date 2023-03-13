import { FC } from "react"
import { useEventDetailsContext } from "./EventDetailsModal"
import { createTextInput, useFormBuilder } from "../form"
import { EventWriteSchema } from "@dotkomonline/types"

export const EventDetailsCommittees: FC = () => {
  const { event } = useEventDetailsContext()
  const FormComponent = useFormBuilder({
    schema: EventWriteSchema,
    label: "Opprett nytt arrangement",
    defaultValues: {
      end: new Date(),
    },
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Åre 2024",
        withAsterisk: true,
      }),
      imageUrl: createTextInput({
        label: "Bildelenke",
        placeholder: "Bilde URL",
      }),
    },
    onSubmit: (data) => console.log(data),
  })
  return (
    <div>
      <h1>Committees for {event.title}</h1>
      {FormComponent}
    </div>
  )
}
