import { server } from "@/utils/trpc/server"
import type { Article } from "@dotkomonline/types"
import { Button, Text, Title } from "@dotkomonline/ui"
import { formatDate } from "@dotkomonline/utils"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

const ArticlePage = async ({ params }: { params: Promise<{ id: string; slug: string }> }) => {
  const { id } = await params

  const article = await server.article.get.query(id)
  if (!article) {
    return notFound()
  }

  const relatedArticles = (await server.article.related.query(article)).slice(0, 6)

  return (
    <div>
      <div className="flex w-full flex-col gap-8 md:flex-row">
        <figure className="w-full flex flex-col md:w-[70%]">
          <Image
            src={article.imageUrl}
            alt="Banner"
            width="0"
            height="0"
            sizes="100%"
            style={{ objectFit: "cover" }}
            className="w-full rounded-2xl aspect-[16/9]"
          />
          <figcaption>
            <Text className="mt-2">
              <span className="text-slate-12 dark:text-slate-2 font-medium">Fotograf: </span>
              {article.photographer}
            </Text>
          </figcaption>
        </figure>
        <div className="hidden md:flex flex-1 flex-col gap-4 justify-evenly">
          <AuthorSection author={article.author} />
          <TagList tags={article.tags} />
        </div>
      </div>
      <Title element="h1" size="xl" className="mt-6">
        {article.title}
      </Title>

      <Byline author={article.author} createdAt={article.createdAt} updatedAt={article.updatedAt} />

      <section>
        <Text className="whitespace-pre-line mt-4 text-slate-11 dark:text-slate-6">{article.excerpt}</Text>
        <Text className="whitespace-pre-line mt-8">{article.content}</Text>
      </section>

      <div className="block md:hidden mt-8">
        <TagList tags={article.tags} />
      </div>

      <RelatedArticles articles={relatedArticles} />
    </div>
  )
}

interface BylineProps {
  author: string
  createdAt: Date
  updatedAt: Date
}

const Byline = ({ author, createdAt, updatedAt }: BylineProps) => (
  <div className="flex flex-wrap gap-x-4 mt-2 border-b-2 border-slate-6 pb-2">
    <Text className="md:hidden whitespace-nowrap">
      <span className="text-slate-12 dark:text-slate-2 font-medium">Skrevet av </span>
      {author}
    </Text>
    <Text className="whitespace-nowrap">
      <span className="text-slate-12 dark:text-slate-2 font-medium">Publisert </span>
      {formatDate(createdAt)}
    </Text>
    {createdAt.getTime() !== updatedAt.getTime() && (
      <Text className="whitespace-nowrap">
        <span className="text-slate-12 dark:text-slate-2 font-medium">Sist endret </span>
        {formatDate(updatedAt)}
      </Text>
    )}
  </div>
)

interface AuthorSectionProps {
  author: string
}

const AuthorSection = ({ author }: AuthorSectionProps) => {
  return (
    <section className="hidden md:flex flex-col gap-2 border-l-2 border-slate-10 pl-4">
      <Text>
        <span className="text-slate-12 dark:text-slate-2 font-medium">Skrevet av</span>
        <br />
        <span> {author}</span>
      </Text>
    </section>
  )
}

interface TagListProps {
  tags: string[]
}

const TagList = ({ tags }: TagListProps) => {
  return (
    <section className="md:pl-4 pb-2 gap-2 md:border-l-2 border-slate-10 flex flex-col">
      <Title element="h3" size="md" className="font-semibold text-slate-12 dark:text-slate-2 font-poppins">
        Tags
      </Title>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag tag={tag} key={tag} />
        ))}
      </div>
    </section>
  )
}

interface TagProps {
  tag: string
}

const Tag = ({ tag }: TagProps) => {
  return (
    <Link href={"/"}>
      <Text className="bg-[#153e75] hover:bg-blue-12 py-1 px-2.5 rounded-full text-white font-semibold">{tag}</Text>
    </Link>
  )
}

interface ArticleCardProps {
  article: Article
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link
      href={`/artikler/${article.slug}/${article.id}`}
      className="flex flex-col flex-1 h-full rounded-lg max-w-md overflow-hidden shadow-md duration-200 transition-transform hover:-translate-y-1 hover:shadow-lg"
    >
      <Image
        src={article.imageUrl}
        alt="Article banner"
        width={0}
        height={0}
        sizes="100%"
        style={{ objectFit: "cover" }}
        className="w-full aspect-[16/9]"
      />
      <div className="p-4 justify-between flex flex-col flex-1">
        <Text className="font-semibold text-lg leading-tight line-clamp-3">{article.title}</Text>
        <p className="text-slate-11 dark:text-slate-6 text-sm mt-1">{formatDate(article.updatedAt)}</p>
      </div>
    </Link>
  )
}

interface RelatedArticlesProps {
  articles: Article[]
}

const RelatedArticles = ({ articles }: RelatedArticlesProps) => {
  return (
    <section className="mt-6 md:mt-12">
      <div className="flex scroll-m-20 justify-between pb-1 tracking-tight transition-colors">
        <Link href="/" className="hover:underline">
          <Title element="h2" className="text-3xl font-poppins font-semibold">
            Relaterte artikler
          </Title>
        </Link>
        <Link href="/" className="hidden sm:block">
          <Button>Flere artikler</Button>
        </Link>
      </div>
      <div className="h-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-2 auto-rows-fr">
        {articles.map((article) => (
          <ArticleCard article={article} key={article.id} />
        ))}
      </div>
    </section>
  )
}

export default ArticlePage
