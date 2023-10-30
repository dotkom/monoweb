import { Event, EventExtra } from "@dotkomonline/types"
import { Button, Flex, InputLabel, TextInput, Title } from "@mantine/core"
import { ContextModalProps, modals } from "@mantine/modals"
import { FC } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useEditEventMutation } from "../mutations/use-edit-event-mutation"

type FormValues = {
  question: string
  alternatives: {
    value: string
  }[]
}

export const CreateEventExtrasModal: FC<ContextModalProps<{ event: Event }>> = ({ context, id, innerProps }) => {
  const editEvent = useEditEventMutation()
  const allExtras = innerProps.event.attendeeQuestions || []

  const defaultAlternatives: FormValues = {
    question: "",
    alternatives: [{ value: "Alternativ 1" }],
  }

  const onSubmit = (data: FormValues) => {
    let newExtras = [
      ...allExtras,
      {
        id: `${allExtras.length - 1}`,
        name: data.question,
        choices: data.alternatives.map((alternative, i) => ({
          id: `${i}`,
          name: alternative.value,
        })),
      },
    ]

    editEvent.mutate({
      id: innerProps.event.id,
      event: {
        ...innerProps.event,
        attendeeQuestions: newExtras,
      },
    })

    context.closeModal(id)
  }

  return <Form onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />
}

export const UpdateEventExtrasModal: FC<ContextModalProps<{ existingExtra: EventExtra; event: Event }>> = ({
  context,
  id,
  innerProps,
}) => {
  const editEvent = useEditEventMutation()

  const allExtras = innerProps.event.attendeeQuestions || []
  const existingExtra = innerProps.existingExtra

  const defaultAlternatives = {
    question: existingExtra.name,
    alternatives: existingExtra.choices.map((choice) => ({
      value: choice.name,
    })),
  }

  const onSubmit = (data: FormValues) => {
    const newExtras = allExtras.map((extra) => {
      if (extra.id === existingExtra.id) {
        return {
          id: extra.id,
          name: data.question,
          choices: data.alternatives.map((alternative, i) => ({
            id: `${i}`,
            name: alternative.value,
          })),
        }
      }
      return extra
    })

    editEvent.mutate({
      id: innerProps.event.id,
      event: {
        ...innerProps.event,
        attendeeQuestions: newExtras,
      },
    })

    context.closeModal(id)
  }

  return <Form onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />
}

interface Props {
  onSubmit: (data: FormValues) => void
  defaultAlternatives: FormValues
}
const Form: FC<Props> = ({ onSubmit, defaultAlternatives }) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: defaultAlternatives,
    mode: "onBlur",
  })
  const { fields, append, remove } = useFieldArray({
    name: "alternatives",
    control,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <InputLabel {...register("question")}>
          Spørsmål
          <TextInput {...register("question")} title="Spørsmål" placeholder="Hvilken mat vil du ha?" />
        </InputLabel>
      </div>

      <Title order={3} mt="md">
        Alternativer
      </Title>
      <hr />
      <Button
        type="button"
        variant="light"
        onClick={() =>
          append({
            value: "",
          })
        }
        mt="sm"
      >
        Nytt alternativ
      </Button>

      {fields.map((field, index) => {
        return (
          <div key={field.id}>
            <Flex key={field.id} mt="sm">
              <TextInput
                placeholder="Alternativ"
                {...register(`alternatives.${index}.value` as const, {
                  required: true,
                })}
                className={errors?.alternatives?.[index]?.value ? "error" : ""}
                style={{
                  width: "100%",
                }}
              />
              <Button type="button" onClick={() => remove(index)} color="red" ml="sm">
                Slett
              </Button>
            </Flex>
          </div>
        )
      })}

      <Button type="submit" mt="sm">
        Bekreft
      </Button>
    </form>
  )
}

export const useCreateEventExtrasModal = ({ event }: { event: Event }) => {
  return () =>
    modals.openContextModal({
      modal: "extras/create",
      title: "Opprett nytt svaralternativ",
      innerProps: {
        event,
      },
    })
}

export const useEditEventExtrasModal = ({ event }: { event: Event }) => {
  return (existingExtra: EventExtra) =>
    modals.openContextModal({
      modal: "extras/update",
      title: "Endre extra",
      innerProps: {
        event,
        existingExtra,
      },
    })
}
