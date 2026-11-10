import { RichText } from "@dotkomonline/ui"

interface EventDescriptionProps {
  description: string
  collapse?: "mobile" | "all"
}

export function EventDescription({ description, collapse }: EventDescriptionProps) {
  const className = "max-w-full prose-img:max-w-full wrap-anywhere"
  const fullDescription = <RichText content={description} className={className} />

  if (collapse === undefined) {
    return fullDescription
  }

  const collapsibleDescription = <RichText content={description} className={className} maxLines={8} />

  if (collapse === "all") {
    return collapsibleDescription
  }

  return (
    <>
      <div className="md:hidden">{collapsibleDescription}</div>
      <div className="max-md:hidden">{fullDescription}</div>
    </>
  )
}
