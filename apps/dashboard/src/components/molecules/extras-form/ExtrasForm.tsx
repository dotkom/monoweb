import { Box, Button, Flex, InputLabel, TextInput } from "@mantine/core"
import { FC } from "react"
import { useFieldArray, useForm } from "react-hook-form"

import { Icon } from "@iconify/react"
import { ActionSelect } from "../../../components/molecules/ActionSelect/ActionSelect"

export type ExtrasFormValues = {
  question: string
  alternatives: {
    value: string
  }[]
}

const templates: Record<string, ExtrasFormValues> = {
  "pizza/sushi": {
    question: "Hvilken mat vil du ha?",
    alternatives: [
      {
        value: "Pizza",
      },
      {
        value: "Sushi",
      },
    ],
  },
}

type TemplateKey = keyof typeof templates

interface Props {
  onSubmit: (data: ExtrasFormValues) => void
  defaultAlternatives: ExtrasFormValues
}
export const ExtrasForm: FC<Props> = ({ onSubmit, defaultAlternatives }) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExtrasFormValues>({
    defaultValues: defaultAlternatives,
    mode: "onBlur",
  })
  const { fields, append, remove } = useFieldArray({
    name: "alternatives",
    control,
  })

  const choices: { value: TemplateKey; label: string }[] = [
    {
      value: "pizza/sushi",
      label: "Pizza/Sushi",
    },
  ]

  return (
    <Box>
      <ActionSelect
        buttonProps={{
          w: "100%",
        }}
        data={choices}
        onChange={(value) => {
          const key = value as TemplateKey
          if (key in templates) {
            const template = templates[key]
            setValue("question", template.question)
            setValue("alternatives", template.alternatives)
          }
        }}
      />
      <Box mt="xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <InputLabel>Spørsmål</InputLabel>
            <TextInput {...register("question")} title="Spørsmål" placeholder="Hvilken mat vil du ha?" />
          </Box>
          <Box mt="md">
            <InputLabel>Svaralternativer</InputLabel>
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <Flex key={field.id} mt={index ? "sm" : undefined}>
                    <TextInput
                      placeholder="Pizza"
                      {...register(`alternatives.${index}.value` as const, {
                        required: true,
                      })}
                      className={errors?.alternatives?.[index]?.value ? "error" : ""}
                      style={{
                        width: "100%",
                      }}
                    />
                    <Button type="button" onClick={() => remove(index)} color="red" ml="sm" variant="light">
                      <Icon icon="tabler:trash" />
                    </Button>
                  </Flex>
                </div>
              )
            })}
          </Box>
          <Button
            type="button"
            variant="light"
            onClick={() =>
              append({
                value: "",
              })
            }
            mt="sm"
            display="block"
            style={{
              margin: "5px auto",
            }}
          >
            <Icon icon="tabler:plus" />
          </Button>

          <Box mt="lg">
            <Button type="submit" mr="sm">
              Bekreft
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  )
}
