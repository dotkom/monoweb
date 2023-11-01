import { type GetStaticPaths, type GetStaticProps, type InferGetStaticPropsType } from "next"
import { type FC } from "react"
import { type Article } from "src/api/get-article"
import sanityClient from "@/api/sanity"
import { ArticleView } from "@/components/views/ArticleView"

type ArticleProps = InferGetStaticPropsType<typeof getStaticProps>

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await sanityClient.fetch<string[]>(`
    *[_type == "article" && !(_id in path("drafts.**"))]{
      slug {
      current
      }
    }.slug.current
  `)
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  }
}

const ARTICLE_QUERY = `
*[_type == "article" && slug.current==$slug && !(_id in path("drafts.**"))][0]{
    title,
    author,
    photographer,
    _createdAt,
    _updatedAt,
    tags,
    excerpt,
    cover_image {
    asset->{url}
      },
    content,
    "numberOfCharacters": length(pt::text(content)),
    // assumes 5 characters as mean word length
    "estimatedWordCount": round(length(pt::text(content)) / 5),
    // Words per minute: 180
    "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180 )
  }
`

export const getStaticProps: GetStaticProps<{ article: Article }, { slug: string }> = async (ctx) => {
  const slug = ctx.params?.slug
  if (!slug) {
    return {
      notFound: true,
    }
  }
  const article = await sanityClient.fetch<Article>(ARTICLE_QUERY, { slug })
  if (!article) {
    return {
      notFound: true,
      revalidate: 3600,
    }
  }
  return { props: { article }, revalidate: 3600 }
}

const ArticlePage: FC<ArticleProps> = (props: ArticleProps) => {
  if (!props.article) {
    return <div>404</div>
  }
  return <ArticleView article={props.article} />
}

export default ArticlePage
