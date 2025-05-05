import { ReadMore, Text } from "@dotkomonline/ui"

export function EventDescription({ description }: { description: string | null }) {
  if (!description) {
    return <Text className="text-slate-10">Ingen beskrivelse</Text>
  }

  return (
    <>
      <div className="sm:hidden">
        <ReadMore text={description} lines={5} />
      </div>

      <div className="hidden sm:block">
        <Text className="whitespace-pre-line">{description}</Text>
      </div>
    </>
  )
}
