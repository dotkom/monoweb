"use server"
import { core } from "src/server/core"
import { ArticleId } from "src/server/types"

export async function updateArticleContent(articleId: ArticleId, content: string) {
  try {
    await core.articleService.putArticleContentById(articleId, content)
  } catch (error) {
    console.error(error)
    return error
  }
}
