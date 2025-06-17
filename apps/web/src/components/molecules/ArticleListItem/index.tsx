import type { Article } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

export interface ArticleListItemProps {
  article: Article
  orientation: "horizontal" | "vertical"
}

export const ArticleListItem: FC<ArticleListItemProps> = ({ article, orientation }: ArticleListItemProps) => (
  <Link
    href={`/artikler/${article.slug}/${article.id}`}
    className={clsx(
      "flex flex-1 rounded-lg overflow-hidden shadow-md duration-200 transition-transform hover:-translate-y-1 hover:shadow-lg",
      orientation === "horizontal" ? "sm:flex-row flex-col" : "flex-col max-w-md"
    )}
  >
    <Image
      src={article.imageUrl}
      alt={article.title}
      width={0}
      height={0}
      sizes="100%"
      className={clsx("aspect-[16/9] object-cover w-full", orientation === "horizontal" && "sm:w-[40%]")}
    />
    <div className="p-4 justify-between flex flex-col flex-1">
      <div>
        <Text className="font-semibold text-lg leading-tight line-clamp-3">{article.title}</Text>
        {orientation === "horizontal" && (
          <div className="flex flex-wrap gap-2 mt-2 max-sm:hidden">
            {article.tags.map((tag) => (
              <Text key={tag} className="text-xs text-slate-12 bg-slate-3 dark:bg-slate-6 px-2 py-1 rounded-xl">
                {tag}
              </Text>
            ))}
          </div>
        )}
      </div>
      <p className="text-slate-11 dark:text-slate-6 text-sm mt-1">{formatDate(article.updatedAt)}</p>
    </div>
  </Link>
)
