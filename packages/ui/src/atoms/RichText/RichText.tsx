import DOMPurify from "isomorphic-dompurify"
import { cn } from "../../utils"

export function RichText({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn("prose font-poppins", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
    />
  )
}
