import { Checkbox, Modal, Button, Select, TextInput, Flex } from "@mantine/core"
import { FC } from "react"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ErrorMessage } from "@hookform/error-message"
import { Committee, EventWrite, EventWriteSchema } from "@dotkomonline/types"
import { trpc } from "../../trpc"
import { DateTimeInput } from "../../components/DateTimeInput"

export type EventCreationModalProps = {
  close: () => void
  committees: Committee[]
}

export const EventCreationModal: FC<EventCreationModalProps> = ({ close, committees }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventWrite>({
    resolver: zodResolver(EventWriteSchema),
    defaultValues: {
      description: null,
      subtitle: null,
      imageUrl: null,
      location: null,
      committeeId: null,
      start: new Date(),
      end: new Date(),
    },
  })
  const utils = trpc.useContext()
  const create = trpc.event.create.useMutation({
    onSuccess: () => {
      utils.event.all.invalidate()
    },
  })
  const onFormSubmit = (data: EventWrite) => {
    create.mutate(data)
    close()
  }
  return (
    <Modal centered title="Opprett nytt arrangement" opened onClose={close}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Flex direction="column" gap="md">
          <TextInput
            placeholder="Åre 2024"
            label="Arrangementnavn"
            error={errors.title && <ErrorMessage errors={errors} name="title" />}
            withAsterisk
            {...register("title")}
          />
          <Controller
            control={control}
            name="start"
            render={({ field }) => (
              <DateTimeInput label="Starttidspunkt" withAsterisk value={field.value} onChange={field.onChange} />
            )}
          />

          <Controller
            control={control}
            name="end"
            render={({ field }) => (
              <DateTimeInput label="Sluttidspunkt" withAsterisk value={field.value} onChange={field.onChange} />
            )}
          />

          <Controller
            control={control}
            name="committeeId"
            render={({ field }) => (
              <Select
                label="Arrangør"
                placeholder="Arrkom"
                data={committees.map((committee) => ({ value: committee.id, label: committee.name }))}
                value={field.value}
                onChange={field.onChange}
                error={errors.committeeId && <ErrorMessage errors={errors} name="committeeId" />}
              />
            )}
          />

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                label="Event status"
                placeholder="Velg en"
                data={[
                  { value: "TBA", label: "TBA" },
                  { value: "PUBLIC", label: "Public" },
                  { value: "NO_LIMIT", label: "No Limit" },
                  { value: "ATTENDANCE", label: "Attendance" },
                ]}
                withAsterisk
                value={field.value}
                onChange={field.onChange}
                error={errors.status && <ErrorMessage errors={errors} name="status" />}
              />
            )}
          />

          <TextInput
            placeholder="Sosialt"
            label="Arrangementtype"
            withAsterisk
            error={errors.type && <ErrorMessage errors={errors} name="type" />}
            {...register("type")}
          />

          <Checkbox label="Offentlig arrangement" {...register("public")} />
          <Button type="submit">Lag nytt event</Button>
        </Flex>
      </form>
    </Modal>
  )
}
