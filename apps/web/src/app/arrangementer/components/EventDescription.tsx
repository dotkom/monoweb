import { RichText } from "@dotkomonline/ui"

export function EventDescription({ description }: { description: string }) {
  return (
    <>
      <div className="min-md:hidden">
        <RichText colorLinks content={description} lineClamp="line-clamp-3" />
      </div>
      <div className="max-md:hidden">
        <RichText colorLinks content={description} />
      </div>
    </>
  )
}
