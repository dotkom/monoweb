import { CompanyWriteSchema } from "@dotkomonline/types"
import type { FC } from "react"
import { useCompanyWriteForm } from "../components/write-form"
import { useEditCompanyMutation } from "../mutations"
import { useCompanyDetailsContext } from "./provider"

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
