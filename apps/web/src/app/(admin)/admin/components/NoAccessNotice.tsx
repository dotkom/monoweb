import { Alert } from "@dotkomonline/ui"
import { IconEye } from "@tabler/icons-react"
import type { ReactNode } from "react"

interface NoAccessNoticeProps {
  title?: ReactNode
  message?: ReactNode
  className?: string
}

export const NoAccessNotice = ({
  title = "Du kan ikke se dette innholdet.",
  message = "Dette er fordi du ikke har tilgang. Kontakt dotkom dersom du mener dette er en feil.",
  className,
}: NoAccessNoticeProps) => {
  return (
    <Alert title={title} icon={<IconEye size={24} />} status="info" className={className}>
      {message}
    </Alert>
  )
}
