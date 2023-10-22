import { JobListingSchema, JobListingWriteSchema } from "@dotkomonline/types"
import {
  createCheckboxInput,
  createDateTimeInput,
  createSelectInput,
  createTagInput,
  createTextInput,
  createTextareaInput,
  useFormBuilder,
} from "src/app/form"
import { useCompanyAllQuery } from "src/modules/company/queries/use-company-all-query"
import { useJobListingAllLocationsQuery } from "src/modules/joblisting/queries/use-joblisting-locations-all-query"
import { z } from "zod"

const JOBLISTING_FORM_DEFAULT_VALUES: Partial<FormValidationSchema> = {}

type UseJobListingWriteFormProps = {
  onSubmit: (data: FormValidationSchema) => void
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
      companyId: createSelectInput({
        label: "Selskap",
        data: companies.map((company) => ({ value: company.id, label: company.name })),
      }),
      title: createTextInput({
        label: "Tittel",
        placeholder: "Frontend-utvikler",
        withAsterisk: true,
      }),
      ingress: createTextareaInput({
        label: "Ingress",
        placeholder: "Kort introduksjon om stillingen...",
        withAsterisk: true,
        rows: 4,
      }),
      description: createTextareaInput({
        label: "Beskrivelse",
        placeholder: "Detaljert beskrivelse av stillingen...",
        withAsterisk: true,
        rows: 30,
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
      deadline: createDateTimeInput({
        label: "Søknadsfrist",
      }),
      employment: createSelectInput({
        label: "Type",
        data: Object.values(JobListingSchema.shape.employment.Values).map((employment) => ({
          value: employment,
          label: employment,
        })),
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
      }),
    },
  })
}
