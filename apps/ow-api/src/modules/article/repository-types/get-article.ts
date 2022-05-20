export interface Article {
  slug: string
  title: string
  author: string
  photographer: string
  _createdAt: string
  _updatedAt: string
  tags: string[]
  excerpt: string
  cover_image: { asset: { url: string } }
  estimatedReadingTime: number
  content: string
}

export const getArticleBySlugQuery = `
*[_type == "article" && slug.current==$slug && !(_id in path("drafts.**"))][0]{
    slug,
    title,
    author,
    photographer,
    _createdAt,
    _updatedAt,
    tags,
    excerpt,
    content,
    cover_image {
    asset->{url}
      },
    "numberOfCharacters": length(pt::text(content)),
    // assumes 5 characters as mean word length
    "estimatedWordCount": round(length(pt::text(content)) / 5),
    // Words per minute: 180
    "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180 )
  }
`
export const getArticlesQuery = `*[_type == "article"] | order(_createdAt desc)[0..$limit]{
    slug, 
    title,
    author,
    photographer,
    _createdAt,
    _updatedAt,
    tags,
    excerpt,
    content,
    cover_image {
    asset->{url}
      },
    "numberOfCharacters": length(pt::text(content)),
    // assumes 5 characters as mean word length
    "estimatedWordCount": round(length(pt::text(content)) / 5),
    // Words per minute: 180
    "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180 )
  }
`

export const getSortedArticlesQuery = `*[_type == "article"] | order(_createdAt desc) [0..$limit]{
  slug, 
  title,
  author,
  photographer,
  _createdAt,
  _updatedAt,
  tags,
  excerpt,
  content,
  cover_image {
  asset->{url}
    },
  "numberOfCharacters": length(pt::text(content)),
  // assumes 5 characters as mean word length
  "estimatedWordCount": round(length(pt::text(content)) / 5),
  // Words per minute: 180
  "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180 )
}
`
