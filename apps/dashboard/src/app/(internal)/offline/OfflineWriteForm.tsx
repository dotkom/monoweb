import { useOfflineFileUploadMutation, useOfflineImageUploadMutation } from "@/app/(internal)/offline/mutations"
import { DateTimePickerField } from "@/components/forms/DateTimePickerField"
import { FileField } from "@/components/forms/FileField"
import { ImageUploadModalField } from "@/components/forms/ImageUploadModalField"
import { Form } from "@/components/forms/new-form/Form"
import { TextField } from "@/components/forms/TextField"
import {
  OFFLINE_FILE_MAX_SIZE_KIB,
  OFFLINE_FILE_WARN_SIZE_KIB,
  OFFLINE_IMAGE_MAX_SIZE_KIB,
  type OfflineWrite,
  OfflineWriteSchema,
} from "@dotkomonline/rpc/offline"
import { Button } from "@dotkomonline/ui/components/button"
import { getCurrentUTC } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const OFFLINE_WRITE_FORM_DEFAULT_VALUES: Partial<OfflineWrite> = {
  publishedAt: getCurrentUTC(),
}

interface Props {
  onSubmit: (data: OfflineWrite) => void
  defaultValues?: Partial<OfflineWrite>
  submitLabel?: string
  disabled?: boolean
}

export const OfflineWriteForm = ({
  onSubmit,
  submitLabel,
  defaultValues = OFFLINE_WRITE_FORM_DEFAULT_VALUES,
  disabled,
}: Props) => {
  const fileUpload = useOfflineFileUploadMutation()
  const imageUpload = useOfflineImageUploadMutation()

  const form = useForm<OfflineWrite>({
    resolver: zodResolver(OfflineWriteSchema),
    defaultValues,
    disabled,
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField control={form.control} name="title" label="Tittel" placeholder="Offline #50" required />
      <DateTimePickerField
        control={form.control}
        name="publishedAt"
        label="Utgivelsesdato"
        placeholder="2023-10-05"
        required
      />
      <FileField
        control={form.control}
        name="fileUrl"
        label="Fil"
        onFileUpload={fileUpload}
        required
        maxSizeKiB={OFFLINE_FILE_MAX_SIZE_KIB}
        warnSizeKiB={OFFLINE_FILE_WARN_SIZE_KIB}
        warnSizeDescription="Filen er over 5 MiB. En stor fil vil ta lang tid å laste inn for brukere. Prøv å gjøre den mindre før opplasting."
      />
      <ImageUploadModalField
        control={form.control}
        name="imageUrl"
        label="Bilde"
        maxSizeKiB={OFFLINE_IMAGE_MAX_SIZE_KIB}
        onFileUpload={imageUpload}
      />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
