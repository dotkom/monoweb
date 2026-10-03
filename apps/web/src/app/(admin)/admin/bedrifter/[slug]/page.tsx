"use client"

import { CompanyWriteForm } from "../CompanyWriteForm"
import { useEditCompanyMutation } from "../mutations"
import { useCompanyDetailsContext } from "./provider"

export default function CompanyInfoPage() {
  const { company } = useCompanyDetailsContext()
  const edit = useEditCompanyMutation()

  return (
    <CompanyWriteForm
      submitLabel="Oppdater bedrift"
      onSubmit={(data) => {
        edit.mutate({ id: company.id, input: data })
      }}
      defaultValues={company}
    />
  )
}
