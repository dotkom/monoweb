import { useFormBuilder } from "@/components/forms/Form"
import { createNumberInput } from "@/components/forms/NumberInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { useTRPC } from "@/lib/trpc-client"
import { useQuery } from "@tanstack/react-query"
import z from "zod"

interface UseMarkWriteFormProps {
  onSubmit(data: MarkForm): void
  defaultValues?: Partial<MarkForm>
  label?: string
  suspension?: boolean
}

const MarkFormSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd"),
  details: z.string().min(1, "Beskrivelse er påkrevd").nullable(),
  weight: z.preprocess(
    (val) => {
      if (typeof val === "string" || typeof val === "number") {
        const num = Number(val)
        return Number.isNaN(num) ? undefined : num
      }
      return undefined
    },
    z.number().min(1).max(6, "Vekt må være mellom 1 og 6")
  ),
  duration: z.number().min(1),
  groupSlug: z.string(),
})

type MarkForm = z.infer<typeof MarkFormSchema>

const MARK_FORM_DEFAULT_VALUES: Partial<MarkForm> = {
  title: "",
  details: "",
  // @ts-expect-error: The default should be a string, but is typed as a number
  weight: "3",
  duration: 14,
}

export const useMarkWriteForm = ({
  onSubmit,
  label = "Edit Mark",
  defaultValues = MARK_FORM_DEFAULT_VALUES,
  suspension,
}: UseMarkWriteFormProps) => {
  const trpc = useTRPC()

  // Should probably be replaced with a query for only groups user is in at some point
  // (will it though? 💀)
  const { data: groups } = useQuery(trpc.group.all.queryOptions())

  return useFormBuilder({
    schema: MarkFormSchema,
    // @ts-expect-error: The default should be a string but is typed as a number
    defaultValues: { ...defaultValues, weight: defaultValues.weight?.toString() },
    onSubmit,
    label,
    fields: {
      title: createTextInput({
        label: "Navn",
        placeholder: "Navn",
        withAsterisk: true,
      }),
      details: createTextInput({
        label: "Beskrivelse",
        autoComplete: "mark-description",
        placeholder: "Beskrivelse",
        withAsterisk: true,
      }),
      weight: createSelectInput({
        label: "Vekt",
        placeholder: "Velg vekt",
        withAsterisk: true,
        display: suspension ? "none" : undefined,
        data: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "Suspensjon" },
        ],
      }),
      groupSlug: createSelectInput({
        label: "Ansvarlig gruppe",
        withAsterisk: true,
        data: (groups ?? []).map((group) => ({
          value: group.slug,
          label: group.name ?? "",
        })),
      }),
      duration: createNumberInput({
        label: "Varighet i dager",
        placeholder: "14",
      }),
    },
  })
}
