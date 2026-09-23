"use client"

import { useCompanyFileUploadMutation } from "@/app/(internal)/bedrifter/mutations"
import { ImageUploadModalField } from "@/components/forms/ImageUploadModalField"
import { Form } from "@/components/forms/new-form/Form"
import { RichTextField } from "@/components/forms/RichTextField"
import { TextField } from "@/components/forms/TextField"
import { COMPANY_IMAGE_MAX_SIZE_KIB, CompanyWriteSchema, type CompanyWrite } from "@dotkomonline/rpc/company"
import { Button } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const COMPANY_WRITE_FORM_DEFAULT_VALUES: Partial<CompanyWrite> = {
  imageUrl: null,
}

interface CompanyWriteFormProps {
  onSubmit: (data: CompanyWrite) => void
  defaultValues?: Partial<CompanyWrite>
  submitLabel?: string
  disabled?: boolean
}

export const CompanyWriteForm = ({
  onSubmit,
  defaultValues = COMPANY_WRITE_FORM_DEFAULT_VALUES,
  submitLabel = "Lagre",
  disabled,
}: CompanyWriteFormProps) => {
  const fileUpload = useCompanyFileUploadMutation()

  const form = useForm<CompanyWrite>({
    resolver: zodResolver(CompanyWriteSchema),
    defaultValues,
    disabled,
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField control={form.control} name="name" label="Navn" placeholder="Bekk" required />
      <TextField control={form.control} name="slug" label="Slug" placeholder="bekk" required />
      <RichTextField control={form.control} name="description" label="Beskrivelse" required />
      <TextField control={form.control} name="email" label="Kontakt-e-post" placeholder="bekk@bekk.no" required />
      <TextField control={form.control} name="website" label="Nettside" placeholder="https://bekk.no" required />
      <TextField control={form.control} name="phone" label="Kontakttelefon" placeholder="+47 123 45 678" />
      <TextField control={form.control} name="location" label="Lokasjon" placeholder="Oslo" required />
      <ImageUploadModalField
        control={form.control}
        name="imageUrl"
        label="Bilde"
        maxSizeKiB={COMPANY_IMAGE_MAX_SIZE_KIB}
        onFileUpload={fileUpload}
      />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
