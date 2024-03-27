import { createServiceLayer } from "src/server/server";

export const useCreateArticle = (service: ArticleService) => {
  return async (title: string, content: string) => {
    return service.createArticle(title, content)
  }
}
