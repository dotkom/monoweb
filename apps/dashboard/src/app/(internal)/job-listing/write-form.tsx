import { createCheckboxInput } from "@/components/forms/CheckboxInput"
import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createRichTextInput } from "@/components/forms/RichTextInput"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTagInput } from "@/components/forms/TagInput"
import { createTextInput } from "@/components/forms/TextInput"
import {
  CompanySchema,
  JobListingLocationSchema,
  JobListingSchema,
  JobListingWriteSchema,
  getJobListingEmploymentName,
} from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { addWeeks, roundToNearestHours } from "date-fns"
import type { z } from "zod"
import { useCompanyAllQuery } from "../company/queries"
import { useJobListingAllLocationsQuery } from "./queries/use-job-listing-locations-all-query"

const nextHour = roundToNearestHours(getCurrentUTC(), { roundingMethod: "ceil" })

const JOBLISTING_FORM_DEFAULT_VALUES: Partial<FormValidationSchema> = {
  start: nextHour,
  end: nextHour,
  deadline: addWeeks(nextHour, 1),
}

interface UseJobListingWriteFormProps {
  onSubmit(data: FormValidationSchema): void
  defaultValues?: Partial<FormValidationSchema>
  label?: string
}

export const FormValidationSchema = JobListingWriteSchema.extend({
  companyId: CompanySchema.shape.id,
  locationIds: JobListingLocationSchema.shape.name.array(),
})
type FormValidationSchema = z.infer<typeof FormValidationSchema>

export const useJobListingWriteForm = ({
  onSubmit,
  label = "Registrer ny stillingsannonse",
  defaultValues = JOBLISTING_FORM_DEFAULT_VALUES,
}: UseJobListingWriteFormProps) => {
  const { companies } = useCompanyAllQuery()
  const { locations } = useJobListingAllLocationsQuery()

  return useFormBuilder({
    schema: FormValidationSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Frontend-utvikler",
        withAsterisk: true,
      }),
      companyId: createSelectInput({
        label: "Selskap",
        placeholder: "Velg selskap",
        data: companies.map((company) => ({ value: company.id, label: company.name })),
        searchable: true,
        withAsterisk: true,
      }),
      description: createRichTextInput({
        label: "Beskrivelse",
        required: true,
      }),
      start: createDateTimeInput({
        label: "Startdato",
        withAsterisk: true,
      }),
      end: createDateTimeInput({
        label: "Sluttdato",
        withAsterisk: true,
      }),
      featured: createCheckboxInput({
        label: "Fremhevet",
      }),
      hidden: createCheckboxInput({
        label: "Gjemt",
      }),
      deadline: createDateTimeInput({
        label: "Søknadsfrist",
      }),
      employment: createSelectInput({
        label: "Type",
        placeholder: "Velg type",
        data: Object.values(JobListingSchema.shape.employment.Values).map((employment) => ({
          value: employment,
          label: getJobListingEmploymentName(employment),
        })),
        withAsterisk: true,
      }),
      applicationLink: createTextInput({
        label: "Søknadslenke",
        placeholder: "https://apply.here.com",
      }),
      applicationEmail: createTextInput({
        label: "Søknads-e-post",
        placeholder: "apply@company.com",
        type: "email",
      }),
      deadlineAsap: createCheckboxInput({
        label: "Frist så snart som mulig",
      }),
      locationIds: createTagInput({
        label: "Sted",
        placeholder: "Velg eller skriv inn et sted",
        data: locations.map((location) => location.name),
        name: "locations",
        withAsterisk: true,
      }),
    },
  })
}
