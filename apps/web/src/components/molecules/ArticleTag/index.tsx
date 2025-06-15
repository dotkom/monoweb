import type { ArticleTagName } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import Link from "next/link"
import type { FC } from "react"

export interface ArticleTagProps {
  tag: ArticleTagName
}

export const ArticleTag: FC<ArticleTagProps> = ({ tag }: ArticleTagProps) => (
  // TODO: Link to filtered articles page
  <Link href={"/"}>
    <Text className="bg-[#153e75] hover:bg-blue-12 py-1 px-3 rounded-full text-white font-semibold">{tag}</Text>
  </Link>
)
