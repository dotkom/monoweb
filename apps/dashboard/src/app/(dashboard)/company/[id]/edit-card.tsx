import { CompanyWriteSchema } from "@dotkomonline/types"
import { type FC } from "react"
import { useEditCompanyMutation } from "src/modules/company/mutations/use-edit-company-mutation"
import { useCompanyDetailsContext } from "./provider"
import { useCompanyWriteForm } from "../write-form"

export const CompanyEditCard: FC = () => {
  const { company } = useCompanyDetailsContext()
  const edit = useEditCompanyMutation()

  const FormComponent = useCompanyWriteForm({
    label: "Oppdater bedrift",
    onSubmit: (data) => {
      const result = CompanyWriteSchema.required({ id: true }).parse(data)
      edit.mutate({ id: company.id, input: result })
    },
    defaultValues: { ...company },
  })
  return <FormComponent />
}
