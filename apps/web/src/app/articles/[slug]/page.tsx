import type { Article } from "@/api/get-article"
import sanityClient from "@/api/sanity"
import { ArticleView } from "@/components/views/ArticleView"

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

const ArticlePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const article = await sanityClient.fetch<Article>(ARTICLE_QUERY, { slug })
  return <ArticleView article={article} />
}

export default ArticlePage
