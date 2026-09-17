import { ErrorMessage } from "../ResourceDetailLayout/ErrorMessage"
import { ResourceDetailLayout } from "./ResourceDetailLayout"

interface ResourceDetailErrorProps {
  backHref: string
  title: string
  message: string
}

export function ResourceDetailError({ backHref, title, message }: ResourceDetailErrorProps) {
  return (
    <ResourceDetailLayout title={title} backHref={backHref} navItems={[]}>
      <ErrorMessage title={title}>{message}</ErrorMessage>
    </ResourceDetailLayout>
  )
}
