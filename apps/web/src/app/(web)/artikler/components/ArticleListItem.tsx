import type { Article } from "@dotkomonline/rpc/article"
import { cn, Text, Title } from "@dotkomonline/ui"
import { IconCalendar, IconPencil } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import Link from "next/link"
import { ArticleImage } from "./ArticleImage"

interface ArticleListItemProps {
  article: Article
  className?: string
  orientation: "horizontal" | "vertical"
}

export const ArticleListItem = ({ article, className, orientation }: ArticleListItemProps) => {
  const { id, slug, title, author, imageUrl, tags, createdAt } = article

  const isHorizontal = orientation === "horizontal"

  return (
    <Link
      prefetch={false}
      href={`/artikler/${slug}/${id}`}
      className={cn(
        "group flex gap-3 transition-colors hover:border-gray-200 dark:hover:border-stone-700 dark:hover:bg-stone-800/20",
        !isHorizontal && "h-fit min-w-0 w-full flex-col gap-3 rounded-2xl border border-transparent p-3",
        isHorizontal && "items-start rounded-xl p-2 sm:gap-4 w-[calc(100%+1rem)] -mx-2 last:-mb-2",
        className
      )}
    >
      <ArticleImage imageUrl={imageUrl} alt={title} orientation={orientation} />

      {!isHorizontal ? (
        <div className="flex min-w-0 w-full flex-col gap-2">
          <Title
            element="h3"
            size="lg"
            className="max-md:text-lg text-xl font-medium line-clamp-2 wrap-break-word transition-colors sm:line-clamp-1"
          >
            {title}
          </Title>

          <div className="flex w-full min-w-0 flex-row flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex w-full flex-row justify-between">
              <div className="flex min-w-0 flex-row items-center gap-2">
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
            {tags.length > 0 && (
              <div className="flex max-h-6 flex-wrap items-center gap-2 overflow-hidden self-center">
                {tags.map((tag) => (
                  <Text
                    key={tag.name}
                    className="whitespace-nowrap rounded-xl bg-brand-accent px-2 py-1 text-xs text-black dark:bg-brand-accent"
                  >
                    {tag.name}
                  </Text>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-row gap-1">
            <Title element="h3" size="sm" className="font-normal line-clamp-1 text-base md:text-lg break-all">
              {title}
            </Title>
          </div>
          <div className="flex h-full flex-col gap-2">
            <div className="flex min-w-0 flex-row items-center gap-2">
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
            <div className="flex max-h-16 max-sm:hidden flex-wrap items-center gap-2 overflow-hidden">
              {tags.map((tag) => (
                <Text
                  key={tag.name}
                  className="wrap-break-words rounded-xl bg-brand-accent px-2 py-1 text-xs text-black dark:bg-brand-accent"
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
