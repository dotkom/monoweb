import { cn } from "@dotkomonline/ui"
import DOMPurify from "isomorphic-dompurify"

export function RenderedContent({ content, className }: { content: string; className?: string }) {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized
    <div
      className={cn("prose font-poppins", className)}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
    />
  )
}
