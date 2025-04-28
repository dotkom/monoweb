import { RenderedContent } from "@/components/molecules/RenderedContent/RenderedContent"

export function EventDescription({ description }: { description: string }) {
  return <RenderedContent content={description} />
}
