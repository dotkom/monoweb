import { Text } from "@dotkomonline/ui";

export function EventDescription({ description }: { description: string }) {
  return (
    <Text className="whitespace-pre-line">
      {description}
    </Text>
  )
}
