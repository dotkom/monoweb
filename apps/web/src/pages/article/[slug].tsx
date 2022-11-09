import { GetServerSideProps } from "next"
import { FC } from "react"
import { fetchArticleData } from "src/api/get-article"
import { Article } from "src/api/get-article"

import { ArticleView } from "@components/views/ArticleView"

interface ArticleProps {
  article: Article
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.query.slug as string
  const data = await fetchArticleData(slug)
  return { props: { article: data } }
}

const ArticlePage: FC<ArticleProps> = (props: ArticleProps) => {
  return <ArticleView article={props.article} />
}

export default ArticlePage
