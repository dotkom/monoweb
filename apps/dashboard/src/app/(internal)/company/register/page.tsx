"use client"

import { useCompanyWriteForm } from "../components/write-form"
import { useCreateCompanyMutation } from "../mutations"

export default function Page() {
  const create = useCreateCompanyMutation()
  const FormComponent = useCompanyWriteForm({
    onSubmit: (data) => {
      create.mutate(data)
      close()
    },
  })
  return <FormComponent />
}
