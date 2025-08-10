import DOMPurify from "isomorphic-dompurify"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"

interface RichTextProps {
  content: string
  colorLinks?: boolean
  className?: string
}

export function RichText({ content, colorLinks, className }: RichTextProps) {
  return (
    <Text
      element="div"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      // prose would be nice to use here, but the styles are really ugly
      className={cn(
        "[&_a]:underline",
        colorLinks && "[&_a]:text-blue-700 dark:[&_a]:text-blue-300",
        "[&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1",
        // Kinda wack but better than nothing
        "[&_code]:px-1 [&_code]:py-0.5 [&_code]:bg-black/10 [&_code]:dark:bg-white/10 [&_code]:rounded-md",
        className
      )}
    />
  )
}
