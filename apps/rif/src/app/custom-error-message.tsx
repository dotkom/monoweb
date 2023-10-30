import { FC } from "react"
import { Message } from "react-hook-form"
import { Text } from "@dotkomonline/ui"

export const CustomErrorMessage: FC<{ message: Message }> = ({ message }) => {
  return (
    <Text size="xs" className="!text-red-9">
      {message}
    </Text>
  )
}
