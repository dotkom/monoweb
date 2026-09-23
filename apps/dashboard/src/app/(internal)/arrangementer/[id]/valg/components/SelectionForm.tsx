"use client"

import { getFieldErrorMessage } from "@/components/forms/FieldShell"
import { TextField } from "@/components/forms/TextField"
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
} from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconChevronDown, IconPlus, IconTrash } from "@tabler/icons-react"
import type { FC } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { templates } from "@/app/(internal)/arrangementer/[id]/valg/templates"

type TemplateKey = keyof typeof templates

const FormValuesSchema = z.object({
  selection: z.string().min(1, "Dette feltet er påkrevd"),
  alternatives: z
    .array(z.object({ value: z.string().min(1, "Dette feltet er påkrevd") }))
    .min(1, "Du må legge til minst ett alternativ"),
})

export type SelectionsFormValues = z.output<typeof FormValuesSchema>
type SelectionsFormInput = z.input<typeof FormValuesSchema>

interface Props {
  onSubmit(data: SelectionsFormValues): void
  defaultAlternatives: SelectionsFormValues
}

const templateOptions: { value: TemplateKey; label: TemplateKey }[] = Object.keys(templates).map((key) => ({
  value: key as TemplateKey,
  label: key as TemplateKey,
}))

export const SelectionsForm: FC<Props> = ({ onSubmit, defaultAlternatives }) => {
  const form = useForm<SelectionsFormInput, unknown, SelectionsFormValues>({
    defaultValues: defaultAlternatives,
    mode: "onSubmit",
    resolver: zodResolver(FormValuesSchema),
  })

  const { fields, append, remove, replace } = useFieldArray({
    name: "alternatives",
    control: form.control,
  })

  const alternativesError = getFieldErrorMessage(form.formState.errors.alternatives?.message)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full" iconRight={<IconChevronDown />}>
            Velg mal
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--anchor-width)">
          {templateOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                const template = templates[option.value]
                form.setValue("selection", template.selection)
                replace(template.alternatives)
              }}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <TextField
        control={form.control}
        name="selection"
        label="Spørsmål"
        placeholder="Hvilken mat vil du ha?"
        required
      />

      <div>
        <Text className="mb-2 text-sm font-medium">Svaralternativer</Text>
        {fields.map((field, index) => (
          <div key={field.id} className={index > 0 ? "mt-2 flex gap-2" : "flex gap-2"}>
            <TextField control={form.control} name={`alternatives.${index}.value`} placeholder="Pizza" />
            <Button variant="destructive" size="icon" onClick={() => remove(index)}>
              <IconTrash />
            </Button>
          </div>
        ))}
        {alternativesError && <Text className="text-sm text-red-600">{alternativesError}</Text>}
      </div>

      <Button
        variant="secondary"
        icon={<IconPlus />}
        onClick={() => {
          append({ value: "" })
        }}
      >
        Legg til alternativ
      </Button>

      <Button type="submit" variant="default" className="w-fit">
        Bekreft
      </Button>
    </form>
  )
}
