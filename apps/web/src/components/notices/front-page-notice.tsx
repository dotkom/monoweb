import { RichText } from "@dotkomonline/ui"
import { marked } from "marked"

export function FrontPageNotice({ text }: { text: string }) {
  if (!text.trim()) {
    return null
  }

  const html = marked.parse(text, { async: false })

  return (
    <aside className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-brand/40 dark:bg-stone-900">
      <RichText content={html} className="max-w-none text-sm [&>*]:my-1" hideToggleButton />
    </aside>
  )
}
