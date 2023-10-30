import { Button, Flex, InputLabel, TextInput, Title } from "@mantine/core"
import { ContextModalProps, modals } from "@mantine/modals"
import { FC } from "react"
import { useFieldArray, useForm } from "react-hook-form"

import { Control, useWatch } from "react-hook-form"
import { useEditEventMutation } from "../mutations/use-edit-event-mutation"
import { useEventDetailsContext } from "../../../app/(dashboard)/event/[id]/provider"
import { useEventGetQuery } from "../queries/use-event-get-query"
import { Event } from "@dotkomonline/types"

type FormValues = {
  question: string
  alternatives: {
    value: string
  }[]
}

const Total = ({ control }: { control: Control<FormValues> }) => {
  const formValues = useWatch({
    name: "alternatives",
    control,
  })
  const total = formValues.length
  return <p>Antall alternativer: {total}</p>
}

export const CreateEventExtrasModal: FC<ContextModalProps> = ({ context, id, innerProps }) => {
  onst edit = useEditEventMutation()

  const event = innerProps.event

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      alternatives: [{ value: "Alternativ 1" }],
    },
    mode: "onBlur",
  })
  const { fields, append, remove } = useFieldArray({
    name: "alternatives",
    control,
  })
  const onSubmit = (data: FormValues) => {
    const newExtras = [
      ...(event.extrasChoice ? event.extrasChoice : []),
      {
        id: Date.now().toString(36),
        name: data.question,
        choices: data.alternatives.map((alternative, i) => ({
          id: Date.now().toString(36) + i,
          name: alternative.value,
        })),
      },
    ]

    edit.mutate({
      id: event.id,
      event: {
        ...event,
        extrasChoice: newExtras,
      },
    })

    context.closeModal(id)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <InputLabel {...register("question")}>
          Spørsmål
          <TextInput {...register("question")} title="Spørsmål" placeholder="Hvilken mat vil du ha?" />
        </InputLabel>
      </div>

      <Title
        order={3}
        style={{
          marginTop: "20px",
        }}
      >
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
        style={{
          marginTop: "10px",
        }}
      >
        Nytt alternativ
      </Button>

      {fields.map((field, index) => {
        return (
          <div key={field.id}>
            <Flex
              key={field.id}
              style={{
                marginTop: "10px",
              }}
            >
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
              <Button
                type="button"
                onClick={() => remove(index)}
                color="red"
                style={{
                  marginLeft: "10px",
                }}
              >
                DELETE
              </Button>
            </Flex>
          </div>
        )
      })}

      <Total control={control} />

      <Button type="submit">SUBMIT</Button>
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
