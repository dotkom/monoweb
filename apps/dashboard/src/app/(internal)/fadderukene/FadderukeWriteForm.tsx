"use client"

import { EventSelectField } from "@/components/forms/EventSelectField"
import { Form } from "@/components/forms/new-form/Form"
import { TextField } from "@/components/forms/TextField"
import { FadderukeWriteSchema, type FadderukeWrite } from "@dotkomonline/rpc/fadderuke"
import { Button } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const FadderukeFormSchema = FadderukeWriteSchema.extend({
  eventId: z.string().min(1, "Velg et hovedarrangement"),
})

type FadderukeFormValues = z.infer<typeof FadderukeFormSchema>

const FADDERUKE_WRITE_FORM_DEFAULT_VALUES: Partial<FadderukeFormValues> = {
  year: getCurrentUTC().getFullYear(),
  eventId: "",
}

interface FadderukeWriteFormProps {
  onSubmit: (data: FadderukeWrite) => void
  defaultValues?: Partial<FadderukeFormValues>
  submitLabel?: string
  disabled?: boolean
}

export const FadderukeWriteForm = ({
  onSubmit,
  defaultValues = FADDERUKE_WRITE_FORM_DEFAULT_VALUES,
  submitLabel = "Opprett fadderuke",
  disabled,
}: FadderukeWriteFormProps) => {
  const form = useForm<FadderukeFormValues>({
    resolver: zodResolver(FadderukeFormSchema),
    defaultValues: {
      year: defaultValues.year ?? FADDERUKE_WRITE_FORM_DEFAULT_VALUES.year ?? new Date().getFullYear(),
      eventId: defaultValues.eventId ?? FADDERUKE_WRITE_FORM_DEFAULT_VALUES.eventId ?? "",
    },
    disabled,
  })

  return (
    <Form
      form={form}
      onSubmit={(data) => {
        onSubmit({
          year: data.year,
          eventId: data.eventId,
        })
      }}
    >
      <TextField
        control={form.control}
        name="year"
        label="År"
        placeholder="2026"
        type="number"
        required
        onChange={(event) => {
          const next = event.target.valueAsNumber
          form.setValue("year", Number.isNaN(next) ? 0 : next, { shouldValidate: true })
        }}
      />
      <EventSelectField
        control={form.control}
        name="eventId"
        label="Hovedarrangement"
        placeholder="Søk etter arrangement..."
        description="Underarrangementer vises i tidslinjen på fadderukesiden."
        required
        excludeChildEvents
      />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
