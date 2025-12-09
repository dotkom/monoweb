import type { FC } from "react"
import { useGroupAllQuery } from "@/app/(internal)/group/queries"
import { useCompanyAllQuery } from "../../company/queries"
import { useEventEditForm } from "../components/edit-form"

import { useUpdateEventMutation } from "../mutations"
import { useEventContext } from "./provider"

export const EventEditCard: FC = () => {
  const { event, attendance } = useEventContext()
  const edit = useUpdateEventMutation()
  const { groups } = useGroupAllQuery()
  const { companies } = useCompanyAllQuery()

  const defaultValues = {
    ...event,
    hostingGroupIds: event.hostingGroups.map((group) => group.slug),
    companyIds: event.companies.map((company) => company.id),
  }

  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    hostingGroups: groups,
    companies: companies,
    onSubmit: (data) => {
      const { hostingGroupIds, companyIds, ...event } = data

      edit.mutate({
        id: data.id,
        event,
        groupIds: hostingGroupIds,
        companyIds,
        parentId: event.parentId,
      })
    },
    defaultValues,
  })
  return <FormComponent />
}
