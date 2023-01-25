import { Text, Title } from "@tremor/react"
import { FC } from "react"

import { ModalChildProps } from "../../components/Modal"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ErrorMessage } from "@hookform/error-message"
import { EventWrite, EventWriteSchema } from "@dotkomonline/types"
import { trpc } from "../../trpc"

export const EventCreationModal: FC<ModalChildProps> = ({ close }) => {
  const {
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
      committeeID: null,
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
    <div className="h-full w-full border bg-white p-6">
      <Title>Opprett nytt arrangement</Title>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <label htmlFor="title">
          <Text>Event tittel</Text>
          <input {...register("title")} id="title" />
          <ErrorMessage errors={errors} name="title" />
        </label>

        <label htmlFor="start">
          <Text>Event start time</Text>
          <input
            {...register("start", {
              valueAsDate: true,
            })}
            id="start"
            type="datetime-local"
          />
          <ErrorMessage errors={errors} name="start" />
        </label>

        <label htmlFor="end">
          <Text>Event end time</Text>
          <input
            {...register("end", {
              valueAsDate: true,
            })}
            id="end"
            type="datetime-local"
          />
          <ErrorMessage errors={errors} name="end" />
        </label>

        <label htmlFor="status">
          <Text>Event status</Text>
          <select {...register("status")}>
            <option value="TBA">TBA</option>
            <option value="PUBLIC">Public</option>
            <option value="NO LIMIT">No limit</option>
            <option value="ATTENDANCE">Attendance</option>
          </select>
          <ErrorMessage errors={errors} name="status" />
        </label>

        <label htmlFor="type">
          <Text>Event type</Text>
          <input {...register("type")} />
          <ErrorMessage errors={errors} name="type" />
        </label>

        <label htmlFor="public">
          <Text>Public event</Text>
          <input type="checkbox" {...register("public")} />
          <ErrorMessage errors={errors} name="public" />
        </label>

        <button type="submit">Lag nytt event</button>
      </form>
    </div>
  )
}
