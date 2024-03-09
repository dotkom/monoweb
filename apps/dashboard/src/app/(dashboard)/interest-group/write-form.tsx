import { InterestGroupWrite, InterestGroupWriteSchema } from "@dotkomonline/types"
import { createTextInput, createTextareaInput, useFormBuilder } from "src/app/form"
import { z } from "zod"

const INTEREST_GROUP_FORM_DEFAULT_VALUES: Partial<InterestGroupWrite> = {}

interface UseInterestGroupWriteFormProps {
  onSubmit(data: InterestGroupWrite): void
  defaultValues?: Partial<InterestGroupWrite>
  label?: string
}

export const useInterestGroupWriteForm = ({
  onSubmit,
  label = "Lag ny interessegruppe",
  defaultValues = INTEREST_GROUP_FORM_DEFAULT_VALUES,
}: UseInterestGroupWriteFormProps) =>
  useFormBuilder({
    schema: InterestGroupWriteSchema,
    defaultValues: defaultValues,
    onSubmit,
    label,
    fields: {
      name: createTextInput({
        label: "Name",
        placeholder: "Interessegruppe",
        withAsterisk: true,
      }),
      description: createTextareaInput({
        label: "Description",
        withAsterisk: true,
        rows: 5,
      }),
      link: createTextInput({
        label: "Slack Link",
        placeholder: "https://onlinentnu.slack.com/archives/C03S8TX1L",
        type: "url",
      }),
    },
  })
