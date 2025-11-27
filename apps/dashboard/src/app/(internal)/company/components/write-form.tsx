import { createFileInput } from "@/components/forms/FileInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createRichTextInput } from "@/components/forms/RichTextInput/RichTextInput"
import { createTextInput } from "@/components/forms/TextInput"
import { type CompanyWrite, CompanyWriteSchema } from "@dotkomonline/types"

const COMPANY_FORM_DEFAULT_VALUES: Partial<CompanyWrite> = {
  imageUrl: null,
}

interface UseCompanyWriteFormProps {
  onSubmit(data: CompanyWrite): void
  defaultValues?: Partial<CompanyWrite>
  label?: string
}

export const useCompanyWriteForm = ({
  onSubmit,
  label = "Registrer ny bedrift",
  defaultValues = COMPANY_FORM_DEFAULT_VALUES,
}: UseCompanyWriteFormProps) =>
  useFormBuilder({
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
      slug: createTextInput({
        label: "Slug",
        placeholder: "bekk",
        withAsterisk: true,
      }),
      description: createRichTextInput({
        label: "Beskrivelse",
        required: true,
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
      phone: createTextInput({
        label: "Kontakttelefon",
        placeholder: "+47 123 45 678",
        type: "tel",
      }),
      location: createTextInput({
        label: "Lokasjon",
        placeholder: "Oslo",
      }),
      imageUrl: createFileInput({
        label: "Bilde",
        placeholder: "Last opp",
      }),
    },
  })
