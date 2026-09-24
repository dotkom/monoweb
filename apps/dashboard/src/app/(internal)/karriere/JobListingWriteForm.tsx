import { CheckboxField } from "@/components/forms/CheckboxField"
import { CompanySelectField } from "@/components/forms/CompanySelectField"
import { DateTimePickerField } from "@/components/forms/DateTimePickerField"
import { Form } from "@/components/forms/Form"
import { RichTextField } from "@/components/forms/RichTextField"
import { SelectField } from "@/components/forms/SelectField"
import { TagField } from "@/components/forms/TagField"
import { TextField } from "@/components/forms/TextField"
import { CompanySchema } from "@dotkomonline/rpc/company"
import {
  JobListingLocationSchema,
  JobListingSchema,
  JobListingWriteSchema,
  getJobListingEmploymentName,
} from "@dotkomonline/rpc/job-listing"
import { Button } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { addWeeks, roundToNearestHours } from "date-fns"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { useJobListingAllLocationsQuery } from "./queries"

const nextHour = roundToNearestHours(getCurrentUTC(), { roundingMethod: "ceil" })

const JOBLISTING_FORM_DEFAULT_VALUES: Partial<FormValidationSchema> = {
  start: nextHour,
  end: addWeeks(nextHour, 1),
  deadline: addWeeks(nextHour, 2),
  featured: false,
  hidden: false,
  rollingAdmission: false,
}

interface UseJobListingWriteFormProps {
  onSubmit(data: FormValidationSchema): void
  defaultValues?: Partial<FormValidationSchema>
  submitLabel?: string
}

export const FormValidationSchema = JobListingWriteSchema.extend({
  companyId: CompanySchema.shape.id,
  locationIds: JobListingLocationSchema.shape.name.array(),
})
type FormValidationSchema = z.infer<typeof FormValidationSchema>

export const JobListingWriteForm = ({
  onSubmit,
  submitLabel = "Registrer ny stillingsannonse",
  defaultValues = JOBLISTING_FORM_DEFAULT_VALUES,
}: UseJobListingWriteFormProps) => {
  const { locations } = useJobListingAllLocationsQuery()

  const form = useForm<FormValidationSchema>({
    resolver: zodResolver(FormValidationSchema),
    defaultValues,
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <TextField control={form.control} name="title" label="Tittel" placeholder="Frontend-utvikler" required />
      <CompanySelectField control={form.control} name="companyId" label="Selskap" placeholder="Velg selskap" required />
      <RichTextField control={form.control} name="description" label="Beskrivelse" required />
      <DateTimePickerField
        control={form.control}
        name="start"
        label="Startdato"
        placeholder="2026-01-01"
        required
        syncOffsetTo="end"
      />
      <DateTimePickerField control={form.control} name="end" label="Sluttdato" placeholder="2026-01-01" required />
      <CheckboxField control={form.control} name="featured" label="Fremhevet" />
      <CheckboxField control={form.control} name="hidden" label="Gjemt" />
      <DateTimePickerField
        control={form.control}
        name="deadline"
        label="Søknadsfrist"
        placeholder="2026-01-01"
        required
      />
      <SelectField
        control={form.control}
        name="employment"
        label="Type"
        placeholder="Velg type"
        required
        options={JobListingSchema.shape.employment.options.map((employment) => ({
          value: employment,
          label: getJobListingEmploymentName(employment),
        }))}
      />
      <TextField
        control={form.control}
        name="applicationLink"
        label="Søknadslenke"
        placeholder="https://apply.here.com"
        required
      />
      <TextField
        control={form.control}
        name="applicationEmail"
        label="Søknads-e-post"
        placeholder="apply@company.com"
        type="email"
        required
      />
      <CheckboxField control={form.control} name="rollingAdmission" label="Frist så snart som mulig" />
      <TagField
        control={form.control}
        name="locationIds"
        label="Sted"
        placeholder="Velg eller skriv inn et sted"
        data={locations.map((location) => location.name)}
        required
      />

      <Button type="submit" variant="default" className="w-fit" disabled={form.formState.disabled}>
        {submitLabel}
      </Button>
    </Form>
  )
}
