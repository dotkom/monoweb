import { type PortableTextProps } from "@/components/molecules/PortableText";

import client from "./sanity";

export interface Article {
    _createdAt: string;
    _updatedAt: string;
    author: string;
    content: PortableTextProps["blocks"];
    cover_image: { asset: { url: string } };
    estimatedReadingTime: number;
    excerpt: string;
    photographer: string;
    tags: Array<string>;
    title: string;
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
`;

export const fetchArticleData = async (slug: string): Promise<Article> => {
    const res = await client.fetch(query, { slug });

    return res;
};
