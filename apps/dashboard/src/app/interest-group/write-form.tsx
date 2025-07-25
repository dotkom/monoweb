import { createCheckboxInput } from "@/components/forms/CheckboxInput"
import { createFileInput } from "@/components/forms/FileInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createTextInput } from "@/components/forms/TextInput"
import { createTextareaInput } from "@/components/forms/TextareaInput"
import { type InterestGroupWrite, InterestGroupWriteSchema } from "@dotkomonline/types"

const INTEREST_GROUP_FORM_DEFAULT_VALUES: Partial<InterestGroupWrite> = {}

interface UseInterestGroupWriteFormProps {
  onSubmit(data: InterestGroupWrite): void
  defaultValues?: Partial<InterestGroupWrite>
  label?: string
}

export const useInterestGroupWriteForm = ({
  onSubmit,
  label = "Lag ny interessegruppe",
  defaultValues = INTEREST_GROUP_FORM_DEFAULT_VALUES,
}: UseInterestGroupWriteFormProps) =>
  useFormBuilder({
    schema: InterestGroupWriteSchema,
    defaultValues: defaultValues,
    onSubmit,
    label,
    fields: {
      name: createTextInput({
        label: "Navn",
        placeholder: "Interessegruppe",
        withAsterisk: true,
        required: true,
      }),
      description: createTextareaInput({
        label: "Kort beskrivelse",
        withAsterisk: true,
        required: true,
        rows: 5,
      }),
      longDescription: createTextareaInput({
        label: "Lang beskrivelse",
        withAsterisk: false,
        rows: 5,
      }),
      imageUrl: createFileInput({
        label: "Bilde",
        placeholder: "Last opp",
        withAsterisk: true,
      }),
      joinInfo: createTextareaInput({
        label: "Hvordan bli med",
        withAsterisk: false,
        rows: 5,
      }),
      link: createTextInput({
        label: "Wiki Link",
        placeholder: "https://wiki.online.ntnu.no/info/innsikt-og-interface/interessegrupper/",
        type: "url",
      }),
      isActive: createCheckboxInput({
        label: "Aktiv",
      }),
    },
  })
