import { useCompanyFileUploadMutation } from "@/app/(internal)/company/mutations"
import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
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
}: UseCompanyWriteFormProps) => {
  const fileUpload = useCompanyFileUploadMutation()

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
      slug: createTextInput({
        label: "Slug",
        placeholder: "bekk",
        withAsterisk: true,
      }),
      description: createRichTextInput({
        label: "Beskrivelse",
        required: true,
        onFileUpload: fileUpload,
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
      imageUrl: createImageInput({
        label: "Bilde",
        placeholder: "Last opp",
        onFileUpload: fileUpload,
      }),
    },
  })
}
