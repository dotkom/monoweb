import type { Article, ArticleTagName, ArticleTag as ArticleTagType } from "@dotkomonline/types"
import { Button, RichText, Text, Title, Video } from "@dotkomonline/ui"
import { richTextToPlainText } from "@dotkomonline/utils"
import clsx from "clsx"
import { formatDate, isEqual } from "date-fns"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { FC } from "react"
import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import { ArticleListItem } from "../../ArticleListItem"

interface ArticlePageProps {
  params: Promise<{
    id: string
    slug: string
  }>
}

const ArticlePage = async ({ params }: ArticlePageProps) => {
  const { id } = await params

  const article = await server.article.get.query(id)
  if (!article) {
    return notFound()
  }

  const relatedArticles = await server.article.related.query(article)

  return (
    <div>
      <ArticleHeader article={article} />
      <Byline author={article.author} createdAt={article.createdAt} updatedAt={article.updatedAt} />

      <section>
        <RichText content={article.excerpt} className="mt-4 font-medium max-w-none" />
        <RichText content={article.content} className="mt-8 max-w-none" />
      </section>

      <div className="block md:hidden mt-8">
        <TagList tags={article.tags} />
      </div>

      <RelatedArticles articles={relatedArticles.slice(0, 6)} />
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
  <div className="flex flex-wrap gap-x-4 mt-2 border-b-2 border-gray-500 dark:border-stone-400 pb-2">
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
    <div className="flex flex-col border-l-2 border-gray-900 dark:border-stone-400 pl-4">
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
    <section className="md:pl-4 pb-2 gap-2 md:border-l-2 border-gray-900 dark:border-stone-400 flex flex-col">
      <Title element="h3" size="md" className="text-black dark:text-gray-100">
        Tags
      </Title>

      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? tags.map((tag) => <Tag tag={tag.name} key={tag.name} />) : <Text>Ingen tags</Text>}
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
        {articles.length > 0 ? (
          articles.map((article) => <ArticleListItem article={article} key={article.id} orientation="vertical" />)
        ) : (
          <Text>Ingen relaterte artikler</Text>
        )}
      </div>
    </section>
  )
}

interface TagProps {
  tag: ArticleTagName
}

const Tag: FC<TagProps> = ({ tag }: TagProps) => (
  <Link href={`/artikler?tag=${tag}`}>
    <Text className="bg-brand hover:bg-brand/80 py-1 px-3 rounded-full text-white font-semibold">{tag}</Text>
  </Link>
)

export async function generateMetadata({ params }: Pick<ArticlePageProps, "params">): Promise<Metadata> {
  const { slug, id } = await params

  const article = await server.article.find.query(id)

  if (!article) {
    return {
      title: "Artikkel ikke funnet | Linjeforeningen Online",
      description: "Artikkelen finnes ikke eller er ikke offentlig tilgjengelig.",
    }
  }

  const description = richTextToPlainText(article.excerpt || article.content)
  const eventUrl = `${env.NEXT_PUBLIC_ORIGIN}/artikler/${slug}/${id}`

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      url: eventUrl,
      siteName: "Linjeforeningen Online",
      images: article.imageUrl
        ? [
            {
              url: article.imageUrl,
              alt: `Banner for ${article.title}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
  }
}

export default ArticlePage
