import { CompanyWrite, CompanyWriteSchema } from "@dotkomonline/types"
import { createSelectInput, createTextInput, createTextareaInput, useFormBuilder } from "../../form"

const COMPANY_FORM_DEFAULT_VALUES: Partial<CompanyWrite> = {
  name: "",
  description: "",
  phone: "",
  email: "",
  website: "",
  location: "",
  type: "Consulting",
  image: "",
}

type UseCompanyWriteFormProps = {
  onSubmit: (data: CompanyWrite) => void
  defaultValues?: Partial<CompanyWrite>
  label?: string
}

export const useCompanyWriteForm = ({
  onSubmit,
  label = "Opprett arrangement",
  defaultValues = COMPANY_FORM_DEFAULT_VALUES,
}: UseCompanyWriteFormProps) => {
  return useFormBuilder({
    schema: CompanyWriteSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      name: createTextInput({
        label: "Navn",
        placeholder: "",
        withAsterisk: true,
      }),
      description: createTextareaInput({
        label: "Beskrivelse",
        placeholder: "",
      }),
      phone: createTextInput({
        label: "Telefon",
        placeholder: "",
      }),
      email: createTextInput({
        label: "Epost",
        placeholder: "",
      }),
      website: createTextInput({
        label: "Nettside",
        placeholder: "",
      }),
      location: createTextInput({
        label: "Sted",
        placeholder: "",
      }),
      type: createSelectInput({
        label: "Type",
        placeholder: "",
        data: [
          { label: "Konsulent", value: "Consulting" },
          { label: "Forskning", value: "Research" },
          { label: "Utvikling", value: "Development" },
          { label: "Annet", value: "Other" },
        ],
      }),
      image: createTextInput({
        label: "Bilde",
        placeholder: "",
      }),
    },
  })
}
