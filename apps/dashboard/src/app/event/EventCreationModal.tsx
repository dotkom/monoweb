import { FC } from "react"

import { ModalChildProps } from "../../components/Modal"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ErrorMessage } from "@hookform/error-message"
import { EventWrite, EventWriteSchema } from "@dotkomonline/types"
import { trpc } from "../../trpc"
import { Button } from "@dotkomonline/ui"

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
      committeeId: null,
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
      <h1>Opprett nytt arrangement</h1>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <label htmlFor="title">
          <p>Event tittel</p>
          <input {...register("title")} id="title" />
          <ErrorMessage errors={errors} name="title" />
        </label>

        <label htmlFor="start">
          <p>Event start time</p>
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
          <p>Event end time</p>
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
          <p>Event status</p>
          <select {...register("status")}>
            <option value="TBA">TBA</option>
            <option value="PUBLIC">Public</option>
            <option value="NO LIMIT">No limit</option>
            <option value="ATTENDANCE">Attendance</option>
          </select>
          <ErrorMessage errors={errors} name="status" />
        </label>

        <label htmlFor="type">
          <p>Event type</p>
          <input {...register("type")} />
          <ErrorMessage errors={errors} name="type" />
        </label>

        <label htmlFor="public">
          <p>Public event</p>
          <input type="checkbox" {...register("public")} />
          <ErrorMessage errors={errors} name="public" />
        </label>

        <Button type="submit">Lag nytt event</Button>
      </form>
    </div>
  )
}
