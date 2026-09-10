import { RichText } from "@dotkomonline/ui"

export function EventDescription({ description }: { description: string }) {
  return (
    <>
      <div className="md:hidden">
        <RichText content={description} className={"max-w-full prose-img:max-w-full"} maxLines={3} />
      </div>
      <div className="max-md:hidden">
        <RichText content={description} className={"max-w-full prose-img:max-w-full"} />
      </div>
    </>
  )
}
