import { Text } from "@dotkomonline/ui"
import type { FC } from "react"
import type { Message } from "react-hook-form"

export const CustomErrorMessage: FC<{ message: Message }> = ({ message }) => (
  <Text size="xs" className="!text-red-9">
    {message}
  </Text>
)
