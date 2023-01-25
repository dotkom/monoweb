import { Text, Title } from "@tremor/react"
import { FC } from "react"

import { ModalChildProps } from "../../components/Modal"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MarkWriteOptionalDuration, MarkWriteOptionalDurationSchema } from "@dotkomonline/types"
import { trpc } from "../../trpc"
import { Button } from "@dotkomonline/ui"

export const MarkCreationModal: FC<ModalChildProps> = ({ close }) => {
  const {
    control,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<MarkWriteOptionalDuration>({
    resolver: zodResolver(MarkWriteOptionalDurationSchema),
  })
  const utils = trpc.useContext()
  const create = trpc.mark.create.useMutation({
    onSuccess: () => {
      utils.mark.all.invalidate()
    },
  })
  const onFormSubmit = (data: MarkWriteOptionalDuration) => {
    create.mutate(data)
    close()
  }

  // TODO: proper form labels
  return (
    <div className="h-full w-full border bg-white p-6">
      {JSON.stringify(errors, null, 2)}
      <Title>Legg til ny prikk</Title>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        {}
        <Text>Tittel</Text>
        <input {...register("title")} />
        <Text>Kattegori</Text>
        <input {...register("category")} />
        <Text>Beskrivelse</Text>
        <input {...register("details")} />
        <Button type="submit">Lag ny prikk</Button>
      </form>
    </div>
  )
}
