"use server"

import { core } from "src/server/core"

export async function existsById(id: string) {
  const articleExists = core.articleService.existsById(id)
  return articleExists
}
