import { RichText } from "@/components/molecules/RichText/RichText"

export function EventDescription({ description }: { description: string }) {
  return <RichText content={description} />
}
