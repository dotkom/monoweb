'use server'

import { core } from "src/server/core"
import { ArticleWrite } from "src/server/types"

export async function getArticle(slug: string){
    const article = core.articleService.findArticleBySlug(slug)
    return article
}

