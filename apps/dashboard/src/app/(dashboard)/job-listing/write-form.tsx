import { JobListingSchema, JobListingWriteSchema } from "@dotkomonline/types"
import {
  createCheckboxInput,
  createDateTimeInput,
  createRichTextInput,
  createSelectInput,
  createTagInput,
  createTextInput,
  createTextareaInput,
  useFormBuilder,
} from "src/app/form"
import type { z } from "zod"
import { useJobListingAllLocationsQuery } from "../../../modules/job-listing/queries/use-job-listing-locations-all-query"
import { useCompanyAllQuery } from "../company/queries"

const JOBLISTING_FORM_DEFAULT_VALUES: Partial<FormValidationSchema> = {}

interface UseJobListingWriteFormProps {
  onSubmit(data: FormValidationSchema): void
  defaultValues?: Partial<FormValidationSchema>
  label?: string
}

export const FormValidationSchema = JobListingWriteSchema
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
        data: companies.map((company) => ({ value: company.id, label: company.name })),
        searchable: true,
        withAsterisk: true,
      }),
      ingress: createTextareaInput({
        label: "Ingress",
        placeholder: "Kort introduksjon om stillingen...",
        required: true,
        rows: 4,
      }),
      description: createRichTextInput({
        label: "Beskrivelse",
        placeholder: "Detaljert beskrivelse av stillingen...",
        markdown: "",
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
        data: Object.values(JobListingSchema.shape.employment.Values).map((employment) => ({
          value: employment,
          label: employment,
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
      locations: createTagInput({
        label: "Sted",
        data: locations,
        name: "locations",
        withAsterisk: true,
      }),
    },
  })
}
