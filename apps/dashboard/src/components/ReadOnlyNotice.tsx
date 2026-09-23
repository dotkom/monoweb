import { Alert } from "@dotkomonline/ui"
import { IconEye } from "@tabler/icons-react"
import type { ReactNode } from "react"

interface ReadOnlyNoticeProps {
  title?: ReactNode
  message?: ReactNode
  className?: string
}

export const ReadOnlyNotice = ({ title, message = "Du har ikke skrivetilgang.", className }: ReadOnlyNoticeProps) => {
  return (
    <Alert title={title} icon={<IconEye size={24} />} status="info" className={className}>
      {message}
    </Alert>
  )
}
