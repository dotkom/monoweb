"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ReadOnlyNotice } from "@admin/components/ReadOnlyNotice"
import { canManageCompanies } from "@dotkomonline/rpc/company-permissions"
import { CompanyWriteForm } from "../CompanyWriteForm"
import { useCreateCompanyMutation } from "../mutations"

export default function Page() {
  const create = useCreateCompanyMutation()
  const authorization = useAuthorization()
  const canCreate = canManageCompanies(authorization)

  return (
    <div className="flex flex-col gap-4">
      {!canCreate && (
        <ReadOnlyNotice
          title="Du kan ikke opprette bedrifter."
          message="Kontakt dotkom dersom du mener dette er en feil."
        />
      )}
      <CompanyWriteForm onSubmit={create.mutate} submitLabel="Registrer ny bedrift" disabled={!canCreate} />
    </div>
  )
}
