import type { Article } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

export interface ArticleListItemProps {
  article: Article
}

export const ArticleListItem: FC<ArticleListItemProps> = ({ article }: ArticleListItemProps) => (
  <Link
    href={`/artikler/${article.slug}/${article.id}`}
    className="flex flex-col flex-1 rounded-lg max-w-md overflow-hidden shadow-md duration-200 transition-transform hover:-translate-y-1 hover:shadow-lg"
  >
    <Image
      src={article.imageUrl}
      alt={article.title}
      width={0}
      height={0}
      sizes="100%"
      className="w-full aspect-[16/9] object-cover"
    />
    <div className="p-4 justify-between flex flex-col flex-1">
      <Text className="font-semibold text-lg leading-tight line-clamp-3">{article.title}</Text>
      <p className="text-slate-11 dark:text-slate-6 text-sm mt-1">{formatDate(article.updatedAt)}</p>
    </div>
  </Link>
)
