import React from "react"

interface EmailListProps {
  email: string
  isPrimary: boolean
}

const EmailList: React.FC<EmailListProps> = ({ email, isPrimary }) => {
  return (
    <div className="mt-1">
      <span className="ml-3">
        <b>{email}</b>
        <span className="ml-3">{isPrimary ? "✅ Primær" : ""}</span>
      </span>
    </div>
  )
}

export default EmailList
