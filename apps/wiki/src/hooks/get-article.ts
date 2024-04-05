"use server"

import { core } from "src/server/core"

export async function getArticle(slug: string) {
  const article = core.articleService.findArticleBySlug(slug)
  return article
}
