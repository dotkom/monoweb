import { RichText } from "@dotkomonline/ui"
import remarkHtml from "remark-html"
import remarkParse from "remark-parse"
import { unified } from "unified"

export function FrontPageNotice({ text }: { text: string }) {
  if (!text.trim()) {
    return null
  }

  const content = text.trimStart().startsWith("<")
    ? text
    : unified().use(remarkParse).use(remarkHtml).processSync(text).toString()

  return (
    <aside className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-brand/40 dark:bg-stone-900">
      <RichText content={content} className="max-w-none text-sm [&>*]:my-1" hideToggleButton />
    </aside>
  )
}
