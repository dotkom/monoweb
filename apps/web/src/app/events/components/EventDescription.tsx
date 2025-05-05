import { Text } from "@dotkomonline/ui"

export function EventDescription({ description }: { description: string | null }) {
  if (!description) {
    return <Text className="text-slate-10">Ingen beskrivelse</Text>
  }

  return <Text className="whitespace-pre-line">{description}</Text>
}
