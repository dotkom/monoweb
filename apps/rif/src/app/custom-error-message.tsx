import { type FC } from "react"
import { type Message } from "react-hook-form"
import { Text } from "@dotkomonline/ui"

export const CustomErrorMessage: FC<{ message: Message }> = ({ message }) => (
  <Text size="xs" className="!text-red-9">
    {message}
  </Text>
)
