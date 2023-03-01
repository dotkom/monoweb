import { FC } from "react"
import { Button, Checkbox, Flex, Select, TextInput } from "@mantine/core"
import { ErrorMessage } from "@hookform/error-message"
import { Controller, useForm } from "react-hook-form"
import { DateTimeInput } from "../../components/DateTimeInput"
import { Committee, EventWrite, EventWriteSchema } from "@dotkomonline/types"
import { zodResolver } from "@hookform/resolvers/zod"

type EventWriteFormComponentProps = {
  committees: Committee[]
}

export const useEventWriteForm = (
  onSubmit: (data: EventWrite) => void,
  defaultValues?: Partial<EventWrite>
): FC<EventWriteFormComponentProps> => {
  return function EventWriteForm({ committees }) {
    const {
      control,
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<EventWrite>({
      resolver: zodResolver(EventWriteSchema),
      defaultValues,
    })

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
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

          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                label="Event type"
                placeholder="Velg en"
                data={[
                  { value: "COMPANY", label: "Sosialt" },
                  { value: "SOCIAL", label: "Bedriftsarrangement" },
                ]}
                withAsterisk
                value={field.value}
                onChange={field.onChange}
                error={errors.type && <ErrorMessage errors={errors} name="type" />}
              />
            )}
          />

          <Checkbox label="Offentlig arrangement" {...register("public")} />
          <Button type="submit">Lag nytt event</Button>
        </Flex>
      </form>
    )
  }
}
