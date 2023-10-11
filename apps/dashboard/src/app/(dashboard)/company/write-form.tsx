import { type CompanyWrite, CompanyWriteSchema } from "@dotkomonline/types"
import { createSelectInput, createTextInput, createTextareaInput, useFormBuilder } from "../../form"

const COMPANY_FORM_DEFAULT_VALUES: Partial<CompanyWrite> = {
  type: "Consulting",
  image: null,
}

interface UseCompanyWriteFormProps {
  onSubmit: (data: CompanyWrite) => void
  defaultValues?: Partial<CompanyWrite>
  label?: string
}

export const useCompanyWriteForm = ({
  onSubmit,
  label = "Registrer ny bedrift",
  defaultValues = COMPANY_FORM_DEFAULT_VALUES,
}: UseCompanyWriteFormProps) => useFormBuilder({
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
      description: createTextareaInput({
        label: "Beskrivelse",
        placeholder: "Bekk er et konsulentselskap fylt med action og moro!",
        withAsterisk: true,
      }),
      email: createTextInput({
        label: "Kontakt-e-post",
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
      type: createSelectInput({
        label: "Bedriftstype",
        placeholder: "Velg en",
        withAsterisk: true,
        data: [
          { value: "Consulting", label: "Konsulentfirma" },
          { value: "Research", label: "Forskning" },
          { value: "Development", label: "In-house" },
          { value: "Other", label: "Annet" },
        ],
      }),
      phone: createTextInput({
        label: "Kontakttelefon",
        placeholder: "+47 123 45 678",
        type: "tel",
      }),
      location: createTextInput({
        label: "Lokasjon",
        placeholder: "Oslo",
      }),
      image: createTextInput({
        label: "Bildelenke til logo",
      }),
    },
  })
