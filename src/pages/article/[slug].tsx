import { ArticleView } from "@components/views/ArticleView";
import { GetServerSideProps } from "next";
import React, { FC } from "react";
import { fetchArticleData } from "src/api/get-article";
import { Article } from "src/api/get-article";

interface ArticleProps {
  article: Article;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.query.slug as string;
  const data = await fetchArticleData(slug);
  return { props: { article: data } };
};

const Article: FC<ArticleProps> = (props: ArticleProps) => {
  return <ArticleView article={props.article} />;
};

export default Article;
