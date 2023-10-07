import { CompanyWriteSchema } from "@dotkomonline/types"
import { FC } from "react"
import { useEditCompanyMutation } from "src/modules/company/mutations/use-edit-company-mutation"
import { useCompanyWriteForm } from "../write-form"
import { useCompanyDetailsContext } from "./provider"

export const CompanyEditCard: FC = () => {
  const { company } = useCompanyDetailsContext()
  const edit = useEditCompanyMutation()

  const FormComponent = useCompanyWriteForm({
    label: "Oppdater bedrift",
    onSubmit: (data) => {
      const result = CompanyWriteSchema.required({ id: true }).parse(data)
      edit.mutate(result)
    },
    defaultValues: { ...company },
  })
  return <FormComponent />
}
