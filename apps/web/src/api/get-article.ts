import { BlockContentProps } from "@sanity/block-content-to-react"

import client from "./sanity"

export interface Article {
  title: string
  author: string
  photographer: string
  _createdAt: string
  _updatedAt: string
  tags: string[]
  excerpt: string
  cover_image: { asset: { url: string } }
  content: BlockContentProps["blocks"]
  estimatedReadingTime: number
}

const query = `
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

export const fetchArticleData = async (slug: string): Promise<Article> => {
  const res = await client.fetch(query, { slug })
  return res
}
