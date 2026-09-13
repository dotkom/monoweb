"use client"

import { useTRPC } from "@/utils/trpc/client"
import { EventRequestWriteSchema, RequestedEventWriteSchema } from "@dotkomonline/rpc/event"
import { Button, Textarea, TextInput, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { addDays } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"

const FormDataSchema = z.object({
  event: RequestedEventWriteSchema,
  eventRequest: EventRequestWriteSchema,
})
type FormData = z.infer<typeof FormDataSchema>

interface Props {
  interestGroupId: string
}

export const EventRequestWriteForm = ({ interestGroupId }: Props) => {
  const trpc = useTRPC()

  const { mutate: createEventRequestMutation } = useMutation(trpc.event.createEventRequest.mutationOptions())
  const form = useForm<FormData>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: {
      eventRequest: {
        interestGroupId: interestGroupId,
        description: "Temp description",
      },
      event: {
        title: "Temp title",
        start: getCurrentUTC(),
        end: addDays(getCurrentUTC(), 1),
        description: "Temp description",
        type: "SOCIAL",
      },
    },
  })

  const onSubmit = (data: FormData) => {
    createEventRequestMutation(data)
  }

  return (
    <div>
      <Title>Send forespørsel om å arrangere et arrangement</Title>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Textarea
          id="eventRequestDescription"
          {...form.register("eventRequest.description")}
          label="Notat til Backlog"
        />

        <TextInput id="title" {...form.register("event.title")} label="Tittel" />
        <TextInput id="start" {...form.register("event.start")} label="Start" />
        <TextInput id="end" {...form.register("event.end")} label="Slutt" />
        <TextInput id="description" {...form.register("event.description")} label="Beskrivelse" />
        <TextInput id="imageUrl" {...form.register("event.imageUrl")} label="Bilde URL" />
        <TextInput id="locationTitle" {...form.register("event.locationTitle")} label="Sted" />
        <TextInput id="locationAddress" {...form.register("event.locationAddress")} label="Adresse" />
        <TextInput id="locationLink" {...form.register("event.locationLink")} label="Lenke" />

        <Button type="submit">Send forespørsel</Button>
      </form>
    </div>
  )
}
