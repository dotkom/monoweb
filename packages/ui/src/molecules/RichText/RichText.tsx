import DOMPurify from "isomorphic-dompurify"
import { cn } from "../../utils"
import { Text } from "../../atoms/Typography/Text";

interface RichTextProps {
  content: string;
  className?: string;
}

export function RichText({ content, className }: RichTextProps) {
  return (
    <Text
      element="div"
      className={cn(className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
    />
  )
}
