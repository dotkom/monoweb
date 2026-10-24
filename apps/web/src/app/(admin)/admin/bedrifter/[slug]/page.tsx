"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { canManageCompanies } from "@dotkomonline/rpc/company-permissions"
import { CompanyWriteForm } from "../CompanyWriteForm"
import { useEditCompanyMutation } from "../mutations"
import { useCompanyDetailsContext } from "./provider"

export default function CompanyInfoPage() {
  const { company } = useCompanyDetailsContext()
  const edit = useEditCompanyMutation()
  const authorization = useAuthorization()
  const canEdit = canManageCompanies(authorization)

  return (
    <CompanyWriteForm
      submitLabel="Oppdater bedrift"
      disabled={!canEdit}
      onSubmit={(data) => {
        edit.mutate({ id: company.id, input: data })
      }}
      defaultValues={company}
    />
  )
}
