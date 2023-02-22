import { Modal, Button, TextInput, Flex } from "@mantine/core"
import { FC } from "react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ErrorMessage } from "@hookform/error-message"
import { CommitteeWrite, CommitteeWriteSchema } from "@dotkomonline/types"
import { trpc } from "../../trpc"

export type CommitteeCreationModalProps = {
  close: () => void
}

export const CommitteeCreationModal: FC<CommitteeCreationModalProps> = ({ close }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommitteeWrite>({
    resolver: zodResolver(CommitteeWriteSchema),
  })
  const utils = trpc.useContext()
  const create = trpc.committee.create.useMutation({
    onSuccess: () => {
      utils.committee.all.invalidate()
    },
  })
  const onFormSubmit = (data: CommitteeWrite) => {
    create.mutate(data)
    close()
  }
  return (
    <Modal centered title="Opprett ny komité" opened onClose={close}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Flex direction="column" gap="md">
          <TextInput
            placeholder="Dotkom"
            label="Komiteenavn"
            error={errors.name && <ErrorMessage errors={errors} name="name" />}
            withAsterisk
            {...register("name")}
          />
          <Button type="submit">Lag ny komité</Button>
        </Flex>
      </form>
    </Modal>
  )
}
