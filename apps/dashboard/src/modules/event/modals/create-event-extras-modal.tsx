import { FC } from "react"
import { Button, Flex, InputLabel, TextInput, Title } from "@mantine/core"
import { ContextModalProps, modals } from "@mantine/modals"
import { Event, EventExtra } from "@dotkomonline/types"
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form"
import { useEditEventMutation } from "../mutations/use-edit-event-mutation"

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

export const CreateEventExtrasModal: FC<ContextModalProps<{ existingExtra?: EventExtra; event: Event }>> = ({
  context,
  id,
  innerProps,
}) => {
  const eventEdit = useEditEventMutation()

  let defaultAlternatives: FormValues
  const allExtras = innerProps.event.extrasChoice || []
  const existingExtra = innerProps.existingExtra

  if (existingExtra) {
    defaultAlternatives = {
      question: existingExtra.name,
      alternatives: existingExtra.choices.map((choice) => ({
        value: choice.name,
      })),
    }
  } else {
    defaultAlternatives = {
      question: "",
      alternatives: [{ value: "Alternativ 1" }],
    }
  }

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

  const onSubmit = (data: FormValues) => {
    let newExtras = []

    if (existingExtra) {
      newExtras = allExtras.map((extra) => {
        if (extra.id === existingExtra.id) {
          return {
            id: extra.id,
            name: data.question,
            choices: data.alternatives.map((alternative, i) => ({
              id: Date.now().toString(36) + i,
              name: alternative.value,
            })),
          }
        }
        return extra
      })
    } else {
      newExtras = [
        ...allExtras,
        {
          id: Date.now().toString(36),
          name: data.question,
          choices: data.alternatives.map((alternative, i) => ({
            id: Date.now().toString(36) + i,
            name: alternative.value,
          })),
        },
      ]
    }

    eventEdit.mutate({
      id: innerProps.event.id,
      event: {
        ...innerProps.event,
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

export const useEditEventExtrasModal = ({ event }: { event: Event }) => {
  return (existingExtra: EventExtra) =>
    modals.openContextModal({
      modal: "extras/create",
      title: "Endre extra",
      innerProps: {
        event,
        existingExtra,
      },
    })
}
