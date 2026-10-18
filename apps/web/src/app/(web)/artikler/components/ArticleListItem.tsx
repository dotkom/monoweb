import type { Article } from "@dotkomonline/rpc/article"
import { cn, Title, Text } from "@dotkomonline/ui"
import Link from "next/link"
import { ArticleImage } from "./ArticleImage"
import { IconCalendar, IconPencil } from "@tabler/icons-react"
import { formatDate } from "date-fns"

interface ArticleCardProps {
  article: Article
  className?: string
  orientation: "horizontal" | "vertical"
}

export const ArticleListItem = ({ article, className, orientation }: ArticleCardProps) => {
  const { id, slug, title, author, imageUrl, tags, createdAt } = article

  return (
    <Link
      prefetch={false}
      href={`/artikler/${slug}/${id}`}
      className={cn(
        "group flex gap-3 hover:border-gray-200 dark:hover:border-stone-700 dark:hover:bg-stone-800/20 transition-colors",
        orientation === "vertical" && "flex-col w-full min-w-0 h-fit gap-3 p-3 rounded-2xl border border-transparent",
        orientation === "horizontal" && "flex sm:gap-4 w-[calc(100%+1rem)] rounded-xl p-2 -mx-2 last:-mb-2",
        className
      )}
    >
      <ArticleImage imageUrl={imageUrl} alt={title} orientation={orientation} />

      {orientation === "vertical" ? (
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
              <div className="flex flex-row items-center gap-2">
                <IconCalendar className="size-4 shrink-0 dark:text-stone-400" />
                <Text className="text-sm wrap-break-word line-clamp-2 transition-colors dark:text-stone-400">
                  {formatDate(createdAt, "dd.MM.yyyy")}
                </Text>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center self-center max-h-[1.5rem] overflow-hidden">
              {tags.map((tag) => (
                <Text
                  key={tag.name}
                  className="text-xs text-black bg-brand-accent dark:bg-brand-accent px-2 py-1 rounded-xl whitespace-nowrap"
                >
                  {tag.name}
                </Text>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-row gap-1">
            <Title element="h3" size="sm" className="font-normal line-clamp-1 text-base md:text-lg break-all">
              {title}
            </Title>
          </div>
          <div className="flex flex-col gap-2 max-w-[22rem] h-full">
            <div className="flex flex-row items-center gap-2 min-w-0">
              <IconPencil className="size-4 shrink-0 dark:text-stone-400" />
              <Text className="text-sm wrap-break-word line-clamp-2 transition-colors dark:text-stone-400">
                {author}
              </Text>
            </div>
            <div className="flex flex-row items-center gap-2">
              <IconCalendar className="size-4 shrink-0 dark:text-stone-400" />
              <Text className="text-sm wrap-break-word line-clamp-2 transition-colors dark:text-stone-400">
                {formatDate(createdAt, "dd.MM.yyyy")}
              </Text>
            </div>
            <div className="flex flex-wrap gap-2 items-center max-sm:hidden max-h-[4rem] overflow-hidden">
              {tags.map((tag) => (
                <Text
                  key={tag.name}
                  className="text-xs text-black bg-brand-accent dark:bg-brand-accent px-2 py-1 rounded-xl wrap-break-words"
                >
                  {tag.name}
                </Text>
              ))}
            </div>
          </div>
        </div>
      )}
    </Link>
  )
}
