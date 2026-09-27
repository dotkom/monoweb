import { Form } from "@/components/forms/Form"
import { SearchField } from "@/components/forms/SearchField"
import type { NotificationRecipientFilterQuery } from "@dotkomonline/rpc/notification"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

interface Props {
  onChange(filters: NotificationRecipientFilterQuery): void
  defaultValues?: NotificationRecipientFilterQuery
}

export const NotificationRecipientFilters = ({ onChange, defaultValues }: Props) => {
  const form = useForm<NotificationRecipientFilterQuery>({
    defaultValues,
  })
  const data = useWatch(form) as NotificationRecipientFilterQuery
  const [debouncedData] = useDebounce(data, 300)

  useEffect(() => {
    onChange(debouncedData)
  }, [onChange, debouncedData])

  return (
    <Form form={form} onSubmit={onChange}>
      <SearchField fixedWidth control={form.control} name="bySearchTerm" placeholder="Søk etter navn..." />
    </Form>
  )
}
