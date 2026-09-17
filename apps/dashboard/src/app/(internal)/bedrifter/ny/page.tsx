"use client"

import { CompanyWriteForm } from "../CompanyWriteForm"
import { useCreateCompanyMutation } from "../mutations"

export default function Page() {
  const create = useCreateCompanyMutation()

  return <CompanyWriteForm onSubmit={create.mutate} submitLabel="Registrer ny bedrift" />
}
