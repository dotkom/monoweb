import { type UserMembership, UserMembershipSchema } from "@dotkomonline/types"
import { createNumberInput, createSelectInput, useFormBuilder } from "../../../form"

interface UseUserMembershipProfileEditFormProps {
  onSubmit(data: UserMembership): void
  defaultValues?: Partial<UserMembership>
  label?: string
}

export const useUserMembershipEditForm = ({
  defaultValues,
  onSubmit,
  label = "Bruker",
}: UseUserMembershipProfileEditFormProps) =>
  useFormBuilder({
    schema: UserMembershipSchema,
    onSubmit,
    defaultValues,
    label,
    fields: {
      startYear: createNumberInput({
        label: "Startår",
        placeholder: "2021",
      }),
      fieldOfStudy: createSelectInput({
        label: "Studieretning",
        data: [
          { label: "Bachelor", value: "BACHELOR" },
          { label: "Master i programvaresystemer", value: "MASTER_SOFTWARE_ENGINEERING" },
          { label: "Master i databaser og søk", value: "MASTER_DATABASE_AND_SEARCH" },
          { label: "Master i algoritmer", value: "MASTER_ALGORITHMS" },
          { label: "Master i kunstig intelligens", value: "MASTER_ARTIFICIAL_INTELLIGENCE" },
          { label: "Sosialt medlem", value: "SOCIAL_MEMBER" },
          { label: "Annet medlem", value: "OTHER_MEMBER" },
          { label: "PhD", value: "PHD" },
        ],
      }),
    },
  })
