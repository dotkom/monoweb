import { RichText } from "@dotkomonline/ui"

export function EventDescription({ description }: { description: string }) {
  return (
    <>
      <div className="min-md:hidden">
        <RichText content={description} maxLines={3} />
      </div>
      <div className="max-md:hidden">
        <RichText content={description} />
      </div>
    </>
  )
}
