import { secondsInDay } from "date-fns/constants"

export const ARTICLE_VIEW_COOKIE_NAME = "article_list_view_mode"

const ARTICLE_VIEW_COOKIE_MAX_AGE_SECONDS = 365 * secondsInDay

export type ArticleListViewMode = "cards" | "list"

export const parseArticlesListViewMode = (value: string | undefined): ArticleListViewMode => {
  if (value === "list") {
    return "list"
  }

  return "cards"
}

export const setArticlesListViewCookie = (view: ArticleListViewMode) => {
  // biome-ignore lint/suspicious/noDocumentCookie: CookieStore unsupported in Safari/Firefox
  document.cookie = `${ARTICLE_VIEW_COOKIE_NAME}=${view}; path=/artikler; max-age=${ARTICLE_VIEW_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}
