import { Text, Title } from "@tremor/react"
import { FC } from "react"

import { ModalChildProps } from "../../components/Modal"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EventWrite, EventWriteSchema } from "@dotkomonline/types"
import { trpc } from "../../trpc"
import { TextInput } from "@tremor/react"
import DatePicker from "react-datepicker"
import Select from "react-select"
import { Button } from "@dotkomonline/ui"

export const EventCreationModal: FC<ModalChildProps> = ({ close }) => {
  const {
    control,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<EventWrite>({
    resolver: zodResolver(EventWriteSchema),
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

  // TODO: proper form labels
  return (
    <div className="h-full w-full border bg-white p-6">
      {JSON.stringify(errors, null, 2)}
      <Title>Opprett nytt arrangement</Title>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        {}
        <Text>Event tittel</Text>
        <Controller
          control={control}
          name="title"
          render={({ field }) => <TextInput onChange={(value) => field.onChange(value)} value={field.value} />}
        />
        <Text>Start</Text>
        <Controller
          control={control}
          name="start"
          render={({ field }) => (
            <DatePicker
              onChange={(date: Date) => field.onChange(date)}
              selected={field.value}
              dateFormat="MMMM d, yyyy h:mm aa"
              showTimeSelect
            />
          )}
        />
        <Text>End</Text>
        <Controller
          control={control}
          name="end"
          render={({ field }) => (
            <DatePicker
              onChange={(date: Date) => field.onChange(date)}
              selected={field.value}
              dateFormat="MMMM d, yyyy h:mm aa"
              showTimeSelect
            />
          )}
        />
        <Text>Status</Text>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              options={[
                {
                  label: "TBA",
                  value: "TBA",
                },
                {
                  label: "Public",
                  value: "PUBLIC",
                },
                {
                  label: "No limit",
                  value: "NO_LIMIT",
                },
                {
                  label: "Attendance",
                  value: "ATTENDANCE",
                },
              ]}
              inputValue={field.value}
              onChange={(value) => field.onChange(value?.value)}
            />
          )}
        />
        <Text>Type</Text>
        <Controller
          control={control}
          name="type"
          render={({ field }) => <TextInput onChange={(value) => field.onChange(value)} value={field.value} />}
        />
        <Text>Public</Text>
        <input type="checkbox" {...register("public")} />

        <Button type="submit">Lag nytt event</Button>
      </form>
    </div>
  )
}
