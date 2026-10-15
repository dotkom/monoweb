import type { Article } from "@dotkomonline/rpc/article"
import { cn, Title, Text } from "@dotkomonline/ui"
import Link from "next/link"
import { ArticleImage } from "./ArticleImage"
import { IconPencil } from "@tabler/icons-react"
import { formatDate } from "date-fns"

interface ArticleCardProps {
  article: Article
  className?: string
}

export const ArticleCard = ({ article, className }: ArticleCardProps) => {
  const { id, slug, title, author, imageUrl, tags, createdAt } = article

  return (
    <Link
      prefetch={false}
      href={`/artikler/${slug}/${id}`}
      className={cn(
        "group flex flex-col w-full min-w-0 h-fit gap-3 p-3 rounded-2xl transition-colors",
        "border border-transparent hover:border-gray-200 dark:hover:border-stone-700 dark:hover:bg-stone-800/20",
        className
      )}
    >
      <ArticleImage imageUrl={imageUrl} alt={title} className="w-full min-w-0" imageClassName="aspect-video w-full" />

      <div className="flex flex-col gap-2 w-full min-w-0">
        <Title
          element="h3"
          size="lg"
          className="max-md:text-lg text-xl font-medium line-clamp-2 wrap-break-word transition-colors sm:line-clamp-1"
        >
          {title}
        </Title>

        <div className="flex flex-row line-clamp-1 flex-wrap items-center gap-x-4 gap-y-2 w-full min-w-0">
          <div className="flex flex-row w-full justify-between">
            <div className="flex flex-row items-center gap-2 min-w-0">
              <IconPencil className="size-4 shrink-0 dark:text-stone-400" />
              <Text className="text-sm wrap-break-word line-clamp-2 transition-colors dark:text-stone-400">
                {author}
              </Text>
            </div>
            <Text className="text-sm wrap-break-word line-clamp-2 transition-colors dark:text-stone-400">
              {formatDate(createdAt, "dd.MM.yyyy")}
            </Text>
          </div>
          <div className="flex flex-wrap gap-2 items-center self-center max-sm:hidden max-h-[1.5rem] overflow-hidden">
            {tags.map((tag) => (
              <Text
                key={tag.name}
                className="text-xs text-white bg-[#EBD4A0] dark:bg-[#4a3522] px-2 py-1 rounded-xl whitespace-nowrap"
              >
                {tag.name}
              </Text>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
