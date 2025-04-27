import { ActionSelect } from "@/components/molecules/ActionSelect/ActionSelect"
import { zodResolver } from "@hookform/resolvers/zod"
import { Icon } from "@iconify/react"
import { Box, Button, Flex, InputLabel, Text, TextInput } from "@mantine/core"
import type { FC } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { templates } from "../templates"

type TemplateKey = keyof typeof templates

const FormValuesSchema = z.object({
  selection: z.string(),
  alternatives: z.array(z.object({ value: z.string().min(1, "Dette feltet er påkrevd") })),
})

export type SelectionsFormValues = z.infer<typeof FormValuesSchema>

interface Props {
  onSubmit(data: SelectionsFormValues): void
  defaultAlternatives: SelectionsFormValues
}

const templateOptions: { value: TemplateKey; label: TemplateKey }[] = Object.keys(templates).map((key) => ({
  value: key,
  label: key,
}))

export const SelectionsForm: FC<Props> = ({ onSubmit, defaultAlternatives }) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SelectionsFormValues>({
    defaultValues: defaultAlternatives,
    mode: "onSubmit",
    resolver: zodResolver(FormValuesSchema),
  })

  const { fields, append, remove } = useFieldArray({
    name: "alternatives",
    control,
  })

  return (
    <Box>
      <ActionSelect
        label="Velg mal"
        buttonProps={{
          w: "100%",
        }}
        data={templateOptions}
        onChange={(value) => {
          const template = templates[value]
          setValue("selection", template.selection)
          setValue("alternatives", template.alternatives)
        }}
      />
      <Box mt="xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <InputLabel>Spørsmål</InputLabel>
            <TextInput {...register("selection")} title="Spørsmål" placeholder="Hvilken mat vil du ha?" />
          </Box>
          <Box mt="md">
            <InputLabel>Svaralternativer</InputLabel>
            {fields.map((field, index) => (
              <Box key={field.id}>
                <Flex key={field.id} mt={index ? "sm" : undefined}>
                  <TextInput
                    placeholder="Pizza"
                    {...register(`alternatives.${index}.value` as const, {
                      required: true,
                    })}
                    style={{
                      width: "100%",
                    }}
                  />
                  <Button type="button" onClick={() => remove(index)} color="red" ml="sm" variant="light">
                    <Icon icon="tabler:trash" />
                  </Button>
                </Flex>
                {errors.alternatives?.[index]?.value && (
                  <Text size="sm" c="red">
                    {errors.alternatives[index]?.value?.message ?? "Ukjent feil"}
                  </Text>
                )}
              </Box>
            ))}
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
