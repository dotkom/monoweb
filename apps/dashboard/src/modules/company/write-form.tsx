import { createSelectInput, createTextInput, useFormBuilder } from "../../app/form"
import { CompanyWrite, CompanyWriteSchema } from "@dotkomonline/types"

const COMPANY_FORM_DEFAULT_VALUES: Partial<CompanyWrite> = {
  type: "Consulting",
  image: null,
}

type UseCompanyWriteFormProps = {
  onSubmit: (data: CompanyWrite) => void
  defaultValues?: Partial<CompanyWrite>
  label?: string
}

export const useCompanyWriteForm = ({
  onSubmit,
  label = "Registrer ny bedrift",
  defaultValues = COMPANY_FORM_DEFAULT_VALUES,
}: UseCompanyWriteFormProps) => {
  return useFormBuilder({
    schema: CompanyWriteSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      name: createTextInput({
        label: "Bedriftsnavn",
        placeholder: "Bekk",
        withAsterisk: true,
      }),
      description: createTextInput({
        label: "Beskrivelse",
        placeholder: "Bekk er et konsulentselskap fylt med action og moro!",
      }),
      phone: createTextInput({
        label: "Kontakt telefon",
        placeholder: "+47 123 45 678",
        type: "tel",
      }),
      email: createTextInput({
        label: "Kontakt e-post",
        placeholder: "bekk@bekk.no",
        type: "email",
        withAsterisk: true,
      }),
      website: createTextInput({
        label: "Nettside",
        placeholder: "https://bekk.no",
        type: "url",
        withAsterisk: true,
      }),
      location: createTextInput({
        label: "Lokasjon",
        placeholder: "Oslo",
      }),
      type: createSelectInput({
        label: "Bedriftstype",
        placeholder: "Velg en",
        data: [
          { value: "Consulting", label: "Konsulentfirma" },
          { value: "Research", label: "Forskning" },
          { value: "Development", label: "In-house" },
          { value: "Other", label: "Annet" },
        ],
      }),
      image: createTextInput({
        label: "Bildelenke logo",
      }),
    },
  })
}
