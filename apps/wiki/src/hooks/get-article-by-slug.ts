"use server"

import { core } from "src/server/core"

export async function getArticleBySlug(slug: string) {
  const article = core.articleService.findArticleBySlug(slug)
  return article
}
