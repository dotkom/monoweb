import { ArticleListItem } from "@/components/molecules/ArticleListItem"
import { ArticleTag } from "@/components/molecules/ArticleTag"
import { server } from "@/utils/trpc/server"
import type { Article, ArticleTag as ArticleTagType } from "@dotkomonline/types"
import { Button, Text, Title, Video } from "@dotkomonline/ui"
import clsx from "clsx"
import { formatDate } from "date-fns"
import { isEqual } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

interface ArticleViewProps {
  article: Article
}

export const ArticleView: FC<ArticleViewProps> = async (props: ArticleViewProps) => {
  const { article } = props

  const relatedArticles = (await server.article.related.query(article)).slice(0, 6)

  return (
    <div>
      <ArticleHeader article={article} />
      <Byline author={article.author} createdAt={article.createdAt} updatedAt={article.updatedAt} />

      <section>
        <Text className="whitespace-pre-line mt-4 text-gray-950 dark:text-gray-500">{article.excerpt}</Text>
        <Text className="whitespace-pre-line mt-8">{article.content}</Text>
      </section>

      <div className="block md:hidden mt-8">
        <TagList tags={article.tags} />
      </div>

      <RelatedArticles articles={relatedArticles} />
    </div>
  )
}

interface ArticleHeaderProps {
  article: Article
}

const ArticleHeader = ({ article }: ArticleHeaderProps) => {
  return (
    <section>
      <div className="flex w-full flex-col gap-8 md:flex-row">
        <figure className="w-full flex flex-col md:w-[70%]">
          {article.vimeoId ? (
            <Video
              src={`https://player.vimeo.com/video/${article.vimeoId}`}
              title={article.title}
              className="w-full rounded-2xl aspect-[16/9] object-cover"
            />
          ) : (
            <Image
              src={article.imageUrl}
              alt={article.title}
              width="0"
              height="0"
              sizes="100%"
              className="w-full rounded-2xl aspect-[16/9] object-cover"
            />
          )}
          <figcaption>
            <Text className="mt-2">
              <span className="text-black dark:text-gray-100 font-medium">Fotograf: </span>
              {article.photographer}
            </Text>
          </figcaption>
        </figure>
        <div className="hidden md:flex flex-1 flex-col gap-4 justify-evenly">
          <AuthorInfo author={article.author} />
          <TagList tags={article.tags} />
        </div>
      </div>
      <Title element="h1" size="xl" className="mt-6">
        {article.title}
      </Title>
    </section>
  )
}

interface BylineProps {
  author: string
  createdAt: Date
  updatedAt: Date
}

const Byline = ({ author, createdAt, updatedAt }: BylineProps) => (
  <div className="flex flex-wrap gap-x-4 mt-2 border-b-2 border-gray-500 pb-2">
    <BylineItem label="Skrevet av" value={author} className="md:hidden" />
    <BylineItem label="Publisert" value={formatDate(createdAt, "dd.MM.yyyy")} />
    {!isEqual(createdAt, updatedAt) && <BylineItem label="Sist endret" value={formatDate(updatedAt, "dd.MM.yyyy")} />}
  </div>
)

interface BylineItemProps {
  label: string
  value: string
  className?: string
}

const BylineItem = ({ label, value, className }: BylineItemProps) => (
  <Text className={clsx("whitespace-nowrap", className)}>
    <span className="text-black dark:text-gray-100 font-medium">{label} </span>
    {value}
  </Text>
)

interface AuthorInfoProps {
  author: string
}

const AuthorInfo = ({ author }: AuthorInfoProps) => {
  return (
    <div className="flex flex-col border-l-2 border-gray-900 pl-4">
      <Text className="text-black dark:text-gray-100 font-medium">Skrevet av</Text>
      <Text>{author}</Text>
    </div>
  )
}

interface TagListProps {
  tags: ArticleTagType[]
}

const TagList = ({ tags }: TagListProps) => {
  return (
    <section className="md:pl-4 pb-2 gap-2 md:border-l-2 border-gray-900 flex flex-col">
      <Title element="h3" size="md" className="text-black dark:text-gray-100">
        Tags
      </Title>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <ArticleTag tag={tag.name} key={tag.name} />
        ))}
      </div>
    </section>
  )
}

interface RelatedArticlesProps {
  articles: Article[]
}

const RelatedArticles = ({ articles }: RelatedArticlesProps) => {
  return (
    <section className="mt-6 md:mt-12">
      <div className="flex justify-between tracking-tight transition-colors">
        <Title element="h2" size="xl">
          Relaterte artikler
        </Title>
        <Link href="/artikler" className="hidden sm:block">
          <Button>Flere artikler</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-3 auto-rows-fr">
        {articles.map((article) => (
          <ArticleListItem article={article} key={article.id} orientation="vertical" />
        ))}
      </div>
    </section>
  )
}
