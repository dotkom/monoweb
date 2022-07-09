import { FC } from "react"
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi"

interface AlertProps {
  status: "info" | "warning" | "success" | "danger"
  showIcon: boolean
}

const Alert: FC<AlertProps> = ({ status, showIcon }) => {
  return (
    <div>
      <AlertIcon status={status} />
    </div>
  )
}

// TODO: style each component
export const AlertIcon: FC<{ status: AlertProps["status"] }> = ({ status }) => {
  switch (status) {
    case "info":
      return <FiAlertCircle />
    case "success":
      return <FiCheckCircle />
    case "danger":
      return <FiAlertCircle />
    case "warning":
      return <FiAlertCircle />
    default:
      return <FiAlertCircle />
  }
}

export default Alert
