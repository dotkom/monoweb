import { server } from "@/utils/trpc/server"
import type { Article } from "@dotkomonline/types"
import { Button, Text, Title } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"

const ArticlePage = async ({ params }: { params: Promise<{ id: string; slug: string }> }) => {
  const { id } = await params

  const article = await server.article.get.query(id)

  if (!article) return <></>

  return (
    <div>
      <div className="flex w-full flex-col gap-8 md:flex-row">
        <div className="w-full flex flex-col md:w-[70%]">
          <figure>
            <Image
              src={article.imageUrl}
              alt="Banner"
              width="0"
              height="0"
              sizes="100%"
              style={{ objectFit: "cover" }}
              className="w-full rounded-2xl bg-slate-5 aspect-[16/9]"
            />
            <figcaption>
              <Text className="mt-2">
                <span className="text-slate-12 dark:text-slate-2 font-medium">Fotograf:</span>
                <span> {article.photographer}</span>
              </Text>
            </figcaption>
          </figure>
        </div>
        <div className="flex flex-1 flex-col gap-4 justify-evenly">
          <AuthorSection author={article.author} />
          <TagList />
        </div>
      </div>
      <Title element="h1" size="xl" className="mt-6">
        {article.title}
      </Title>
      <Text className="mt-2 border-b-2 border-slate-6 pb-2">
        <span className="md:hidden">
          <span className="text-slate-12 dark:text-slate-2 font-medium">Skrevet av </span>
          <span>{article.author} </span>
        </span>
        <span className="text-slate-12 dark:text-slate-2 font-medium border-l border-slate-10 pl-2">Publisert </span>
        <span>{article.createdAt.toLocaleDateString()}</span>
        {article.createdAt.toLocaleDateString() !== article.updatedAt.toLocaleDateString() && (
          <>
            <span className="text-slate-12 dark:text-slate-2 font-medium border-l border-slate-10 pl-2 ml-2">
              Sist endret{" "}
            </span>
            <span>{article.updatedAt.toLocaleDateString()}</span>
          </>
        )}
      </Text>

      <section>
        <Text className="mt-4 text-slate-11 dark:text-slate-6">{article.excerpt}</Text>
        <Text className="whitespace-pre-line mt-8">{article.content}</Text>
      </section>

      <RelatedArticles article={article} />
    </div>
  )
}

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

const TagList = () => {
  return (
    <section className="px-4 pb-4 gap-4 border-l-2 border-slate-10">
      <Title element="h2" size="lg" className="font-semibold font-poppins">
        Tags
      </Title>
      <div className="flex flex-wrap gap-2 mt-4">
        <Tag link={"/"}>Velkomst</Tag>
        <Tag link={"/"}>Tips</Tag>
        <Tag link={"/"}>Guide</Tag>
        <Tag link={"/"}>Triks</Tag>
        <Tag link={"/"}>Online</Tag>
      </div>
    </section>
  )
}

interface TagProps {
  children: string
  link: string
}

const Tag = ({ children, link }: TagProps) => {
  return (
    <Link href={link}>
      <Text className="bg-[#153e75] hover:bg-blue-12 py-1 px-2.5 rounded-full text-white font-semibold">
        {children}
      </Text>
    </Link>
  )
}

interface ArticleCardProps {
  article: Article
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <Link href="/">
      <div className="flex flex-row sm:flex-col rounded-lg sm:max-w-72 overflow-hidden sm:pb-4 shadow-md bg-white text-black duration-200 transition-transform hover:-translate-y-1 hover:shadow-lg">
        <Image
          src="https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/wide/e3f8b563-fd2c-4bae-a56a-a26773281ec9.png"
          alt="Article banner"
          width={0}
          height={0}
          sizes="100%"
          style={{ objectFit: "cover" }}
          className="w-full bg-slate-5 aspect-[16/9]"
        />
        <div className="p-4">
          <Text className="font-semibold text-lg leading-tight">{article.title}</Text>
          <p className="text-slate-11 text-sm mt-1">{article.updatedAt.toLocaleDateString()}</p>
        </div>
      </div>
    </Link>
  )
}

interface RelatedArticlesProps {
  article: Article
}

const RelatedArticles = ({ article }: RelatedArticlesProps) => {
  return (
    <section className="mt-12">
      <div className="flex scroll-m-20 justify-between pb-1 tracking-tight transition-colors">
        <Link href="/" className="text-3xl font-semibold hover:underline">
          Relaterte artikler
        </Link>
        <Link href="/" className="hidden sm:block">
          <Button>Flere artikler</Button>
        </Link>
      </div>
      <div className="flex mt-2 flex-wrap gap-12">
        <ArticleCard article={article} />
        <ArticleCard article={article} />
        <ArticleCard article={article} />
        <ArticleCard article={article} />
        <ArticleCard article={article} />
      </div>
    </section>
  )
}

export default ArticlePage
