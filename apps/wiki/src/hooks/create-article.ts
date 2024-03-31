"use server"

import { core } from "src/server/core"
import { ArticleWrite } from "src/server/types"

export async function createArticle(article: ArticleWrite) {
  core.articleService.createArticle(article)
  return
}
