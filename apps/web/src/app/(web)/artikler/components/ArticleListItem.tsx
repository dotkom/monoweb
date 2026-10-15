import type { Article } from "@dotkomonline/rpc/article"
import { cn, Title, Text } from "@dotkomonline/ui"
import Link from "next/link"
import { ArticleThumbnail } from "./ArticleThumbnail"
import { IconCalendar, IconPencil } from "@tabler/icons-react"
import { formatDate } from "date-fns"

interface ArticleListItemProps {
  article: Article
  className?: string
  compact?: boolean
}

export const ArticleListItem = ({ article, className, compact }: ArticleListItemProps) => {
  const { id, slug, title, author, imageUrl, tags, createdAt } = article

  return (
    <Link
      prefetch={false}
      href={`/artikler/${slug}/${id}`}
      className={cn(
        // [calc(100%+1rem)] is to offset the -mx-2
        "group flex flex-row gap-3 sm:gap-4 w-[calc(100%+1rem)] rounded-xl p-2 -mx-2 last:-mb-2",
        "hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors",
        compact && "sm:gap-3",
        className
      )}
    >
      <ArticleThumbnail imageUrl={imageUrl} alt={title} compact={compact} />

      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-row gap-1">
          <Title
            element="h3"
            size="sm"
            className={cn(
              "font-normal line-clamp-1",
              !compact && "text-base md:text-lg break-all",
              compact && "text-xs sm:text-sm font-medium"
            )}
          >
            {title}
          </Title>
        </div>
        <div className="flex flex-col gap-2 max-w-[28rem] h-full">
          <div className="flex flex-row items-center gap-2 min-w-0">
            <IconPencil className="size-4 shrink-0 dark:text-stone-400" />
            <Text className="text-sm wrap-break-word line-clamp-2 transition-colors dark:text-stone-400">{author}</Text>
          </div>
          <div className="flex flex-wrap gap-2 items-center max-sm:hidden max-h-[1.5rem] overflow-hidden">
            {tags.map((tag) => (
              <Text
                key={tag.name}
                className="text-xs text-white bg-[#EBD4A0] dark:bg-[#4a3522] px-2 py-1 rounded-xl whitespace-nowrap"
              >
                {tag.name}
              </Text>
            ))}
          </div>
          <div className="flex flex-row items-center gap-2 mt-auto">
            <IconCalendar className="size-4 shrink-0 dark:text-stone-400" />
            <Text className="text-sm wrap-break-word line-clamp-2 transition-colors dark:text-stone-400">
              {formatDate(createdAt, "dd.MM.yyyy")}
            </Text>
          </div>
        </div>
      </div>
    </Link>
  )
}
