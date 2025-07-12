import { Text } from "@dotkomonline/ui"
import type { FC } from "react"
import type { Message } from "react-hook-form"

export const CustomErrorMessage: FC<{ message: Message }> = ({ message }) => (
  <Text size="sm" className="!text-red-800">
    {message}
  </Text>
)
