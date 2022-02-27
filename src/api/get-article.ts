import { BlockContentProps } from "@sanity/block-content-to-react";
import client from "./sanity";

export interface Article {
  title: string;
  author: string;
  _createdAt: string;
  _updatedAt: string;
  tags: string[];
  excerpt: string;
  cover_image: string;
  content: BlockContentProps["blocks"];
}

const query = `
*[_type == "article" && slug.current==$slug && !(_id in path("drafts.**"))][0]{
    title,
    author,
    _createdAt,
    _updatedAt,
    tags,
    excerpt,
    cover_image {
    asset->{url}
      },
    content
  }
`;

export const fetchArticleData = async (slug: string): Promise<Article> => {
  const res = await client.fetch(query, { slug });
  return res;
};
