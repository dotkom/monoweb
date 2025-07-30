import { RichText } from "@dotkomonline/ui"

export function EventDescription({ description }: { description: string }) {
  return <RichText colorLinks content={description} />
}
