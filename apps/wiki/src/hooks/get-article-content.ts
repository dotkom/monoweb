"use server"

import { core } from "src/server/core"
import { ArticleId } from "src/server/types"

export async function getArticleContent(articleId: ArticleId) {
  try {
    return await core.articleService.getArticleContentById(articleId)
  } catch (error) {
    console.error(error)
    return
  }
}
